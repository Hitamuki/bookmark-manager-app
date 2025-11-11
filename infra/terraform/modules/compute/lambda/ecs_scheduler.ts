/**
 * ECS Task Auto Scheduler Lambda Function
 *
 * 月〜金の9:00-22:00 JST (0:00-13:00 UTC) にECSタスクを自動起動/停止
 *
 * Environment Variables:
 * - CLUSTER_NAME: ECSクラスター名
 * - WEB_SERVICE_NAME: WebサービスのECSサービス名
 * - API_SERVICE_NAME: APIサービスのECSサービス名
 * - DESIRED_COUNT: 起動時のタスク数 (デフォルト: 1)
 * - ACTION: 'start' | 'stop'
 */

import { ECSClient, UpdateServiceCommand } from '@aws-sdk/client-ecs';

interface SchedulerEvent {
  action: 'start' | 'stop';
}

interface EnvironmentVariables {
  CLUSTER_NAME: string;
  WEB_SERVICE_NAME: string;
  API_SERVICE_NAME: string;
  DESIRED_COUNT?: string;
  ACTION?: 'start' | 'stop';
}

const ecsClient = new ECSClient({ region: process.env.ECS_REGION || 'ap-northeast-1' });

/**
 * ECSサービスのタスク数を更新
 */
async function updateEcsService(clusterName: string, serviceName: string, desiredCount: number): Promise<void> {
  const command = new UpdateServiceCommand({
    cluster: clusterName,
    service: serviceName,
    desiredCount,
  });

  try {
    const response = await ecsClient.send(command);
    console.log(`Successfully updated ${serviceName}:`, {
      serviceName: response.service?.serviceName,
      desiredCount: response.service?.desiredCount,
      runningCount: response.service?.runningCount,
    });
  } catch (error) {
    console.error(`Failed to update ${serviceName}:`, error);
    throw error;
  }
}

/**
 * Lambda Handler
 */
export async function handler(event: SchedulerEvent): Promise<{ statusCode: number; body: string }> {
  console.log('Event received:', JSON.stringify(event, null, 2));

  const env = process.env as unknown as EnvironmentVariables;

  // 環境変数の検証
  if (!env.CLUSTER_NAME || !env.WEB_SERVICE_NAME || !env.API_SERVICE_NAME) {
    const errorMessage = 'Missing required environment variables';
    console.error(errorMessage);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: errorMessage }),
    };
  }

  // アクション決定 (EventBridgeのinputまたは環境変数から)
  const action = event.action || env.ACTION;
  if (!action || (action !== 'start' && action !== 'stop')) {
    const errorMessage = 'Invalid action. Must be "start" or "stop"';
    console.error(errorMessage);
    return {
      statusCode: 400,
      body: JSON.stringify({ error: errorMessage }),
    };
  }

  // タスク数の決定
  const desiredCount = action === 'start' ? Number.parseInt(env.DESIRED_COUNT || '1', 10) : 0;

  console.log(`Action: ${action}, Target desired count: ${desiredCount}`);

  try {
    // Webサービスを更新
    await updateEcsService(env.CLUSTER_NAME, env.WEB_SERVICE_NAME, desiredCount);

    // APIサービスを更新
    await updateEcsService(env.CLUSTER_NAME, env.API_SERVICE_NAME, desiredCount);

    const message = `Successfully ${action === 'start' ? 'started' : 'stopped'} ECS services`;
    console.log(message);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message,
        action,
        desiredCount,
        services: [env.WEB_SERVICE_NAME, env.API_SERVICE_NAME],
      }),
    };
  } catch (error) {
    console.error('Error updating ECS services:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Failed to update ECS services',
        details: error instanceof Error ? error.message : 'Unknown error',
      }),
    };
  }
}
