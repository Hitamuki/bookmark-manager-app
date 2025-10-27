/**
 * 「/samples」のパフォーマンステスト
 */
import { check, sleep } from 'k6';
import http from 'k6/http';

export const options = {
  vus: 10, // 同時に実行される仮想ユーザー（VUs）
  // VUsの数を段階的に増減させる
  stages: [
    { duration: '5s', target: 5 },
    { duration: '5s', target: 10 },
    { duration: '5s', target: 5 },
    { duration: '5s', target: 0 },
  ],
  // テストの成功条件
  thresholds: {
    http_req_failed: ['rate<0.01'], // リクエストに失敗する割合
    http_req_duration: ['p(90)<2000'], // レスポンスタイムの閾値
  },
};

// テスト実行前に呼び出される
export function setup() {}

// サンプル作成のテスト
export default function () {
  // Arrange
  const url = 'http://localhost:4000/api/samples';
  const payload = JSON.stringify({
    title: 'タイトル_性能テスト',
  });
  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  // Act
  const res = http.post(url, payload, params);

  // Assert
  check(res, {
    'status is 201': (r) => r.status === 201,
  });

  sleep(1);
}

// テスト実行後に呼び出される
export function teardown() {}
