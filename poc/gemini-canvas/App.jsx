import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signInAnonymously, signInWithCustomToken } from 'firebase/auth';
import { addDoc, collection, doc, getFirestore, onSnapshot, query, updateDoc } from 'firebase/firestore';
// @ts-nocheck
import React, { createContext, useContext, useState, useEffect } from 'react';

// nanoid と moment.js をCDNからロードする
// nanoidの代わりにcrypto.randomUUID()を使用可能だが、古いブラウザ対応のためnanoidを推奨。
// ただし、Canvasの環境ではnanoidのnpmパッケージは直接インポートできないため、crypto.randomUUID()を使用。
// momentはCDNで提供されるため、window.momentを使用。

// グローバル変数からの取得
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

// Firebaseアプリの初期化 (クライアントサイドでのみ実行)
let firebaseApp;
if (typeof window !== 'undefined' && Object.keys(firebaseConfig).length > 0) {
  firebaseApp = initializeApp(firebaseConfig);
}

// アプリケーションのコンテキストを作成
const AppContext = createContext();

// AppContext.jsx の内容をここに統合
export const AppProvider = ({ children }) => {
  const [db, setDb] = useState(null);
  const [auth, setAuth] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  // プロファイルとアイテムのモックデータ構造 (Firestoreから取得するまでの一時的なもの)
  const initialProfiles = [
    { id: 'all', name: '全て' },
    { id: 'private', name: 'プライベート' },
    { id: 'business', name: 'ビジネス' },
    { id: 'learning', name: '学習' },
  ];

  const [activeProfileId, setActiveProfileId] = useState('all');
  const [items, setItems] = useState([]);
  const [profiles, setProfiles] = useState(initialProfiles);
  const [customCategories, setCustomCategories] = useState([]);
  const [customTags, setCustomTags] = useState([]);

  useEffect(() => {
    if (!firebaseApp) {
      console.warn("Firebase app not initialized. Check firebaseConfig.");
      // Firebaseがない場合でも、モックデータで動作するように設定
      setIsAuthReady(true);
      return;
    }

    const firestore = getFirestore(firebaseApp);
    const firebaseAuth = getAuth(firebaseApp);

    setDb(firestore);
    setAuth(firebaseAuth);

    const unsubscribeAuth = onAuthStateChanged(firebaseAuth, async (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        try {
          if (initialAuthToken) {
            await signInWithCustomToken(firebaseAuth, initialAuthToken);
          } else {
            await signInAnonymously(firebaseAuth);
          }
          setUserId(firebaseAuth.currentUser?.uid || crypto.randomUUID());
        } catch (error) {
          console.error("Firebase Auth Error:", error);
          setUserId(crypto.randomUUID());
        }
      }
      setIsAuthReady(true);
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!db || !userId || !isAuthReady) return;

    // Firestoreからアイテムをリアルタイムで取得
    const itemsCollectionRef = collection(db, `artifacts/${appId}/users/${userId}/items`);
    const unsubscribeItems = onSnapshot(itemsCollectionRef, (snapshot) => {
      const fetchedItems = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setItems(fetchedItems);
    }, (error) => {
      console.error("Error fetching items from Firestore:", error);
    });

    // Firestoreからカスタムカテゴリをリアルタイムで取得
    const categoriesCollectionRef = collection(db, `artifacts/${appId}/users/${userId}/categories`);
    const unsubscribeCategories = onSnapshot(categoriesCollectionRef, (snapshot) => {
      const fetchedCategories = snapshot.docs.map(doc => ({ id: doc.id, name: doc.data().name }));
      setCustomCategories(fetchedCategories);
    }, (error) => {
      console.error("Error fetching categories from Firestore:", error);
    });

    // Firestoreからカスタムタグをリアルタイムで取得
    const tagsCollectionRef = collection(db, `artifacts/${appId}/users/${userId}/tags`);
    const unsubscribeTags = onSnapshot(tagsCollectionRef, (snapshot) => {
      const fetchedTags = snapshot.docs.map(doc => ({ id: doc.id, name: doc.data().name }));
      setCustomTags(fetchedTags);
    }, (error) => {
      console.error("Error fetching tags from Firestore:", error);
    });

    // Firestoreからプロファイルをリアルタイムで取得 (Optional)
    const profilesCollectionRef = collection(db, `artifacts/${appId}/users/${userId}/profiles`);
    const unsubscribeProfiles = onSnapshot(profilesCollectionRef, (snapshot) => {
      const fetchedProfiles = snapshot.docs.map(doc => ({ id: doc.id, name: doc.data().name }));
      setProfiles([...initialProfiles.filter(p => p.id === 'all'), ...fetchedProfiles]);
    }, (error) => {
      console.error("Error fetching profiles from Firestore:", error);
    });

    return () => {
      unsubscribeItems();
      unsubscribeCategories();
      unsubscribeTags();
      unsubscribeProfiles();
    };
  }, [db, userId, appId, isAuthReady]);

  // フィルターされたアイテム
  const filteredItems = activeProfileId === 'all'
    ? items.filter(item => !item.isDeleted && !item.isArchived)
    : items.filter(item => item.profileId === activeProfileId && !item.isDeleted && !item.isArchived);

  // Firestoreへのアイテム追加 (例)
  const addItem = async (newItem) => {
    if (!db || !userId) {
      console.error("Firestore DB or userId is not available.");
      return;
    }
    try {
      const itemsCollection = collection(db, `artifacts/${appId}/users/${userId}/items`);
      const docRef = await addDoc(itemsCollection, { ...newItem });
      console.log("Document written with ID: ", docRef.id);
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  };

  // Firestoreでのアイテム更新 (例)
  const updateItem = async (itemId, updatedFields) => {
    if (!db || !userId) {
      console.error("Firestore DB or userId is not available.");
      return;
    }
    try {
      const itemDocRef = doc(db, `artifacts/${appId}/users/${userId}/items`, itemId);
      await updateDoc(itemDocRef, updatedFields);
      console.log("Document updated successfully.");
    } catch (e) {
      console.error("Error updating document: ", e);
    }
  };

  // Firestoreでのアイテム削除 (論理削除)
  const deleteItem = async (itemId) => {
    if (!db || !userId) {
      console.error("Firestore DB or userId is not available.");
      return;
    }
    try {
      const itemDocRef = doc(db, `artifacts/${appId}/users/${userId}/items`, itemId);
      await updateDoc(itemDocRef, { isDeleted: true, status: '削除' });
      console.log("Document marked as deleted.");
    } catch (e) {
      console.error("Error deleting document: ", e);
    }
  };

  // Firestoreでのアイテムアーカイブ (論理アーカイブ)
  const archiveItem = async (itemId) => {
    if (!db || !userId) {
      console.error("Firestore DB or userId is not available.");
      return;
    }
    try {
      const itemDocRef = doc(db, `artifacts/${appId}/users/${userId}/items`, itemId);
      await updateDoc(itemDocRef, { isArchived: true, status: 'アーカイブ' });
      console.log("Document marked as archived.");
    } catch (e) {
      console.error("Error archiving document: ", e);
    }
  };

  // Firestoreでのアイテム復元 (ゴミ箱/アーカイブから)
  const restoreItem = async (itemId) => {
    if (!db || !userId) {
      console.error("Firestore DB or userId is not available.");
      return;
    }
    try {
      const itemDocRef = doc(db, `artifacts/${appId}/users/${userId}/items`, itemId);
      await updateDoc(itemDocRef, { isDeleted: false, isArchived: false, status: '未定' });
      console.log("Document restored.");
    } catch (e) {
      console.error("Error restoring document: ", e);
    }
  };

  // カテゴリやタグの追加、更新、削除の関数も同様にFirestoreと連携して実装
  const addCategory = async (name) => {
    if (!db || !userId) return;
    try {
      await addDoc(collection(db, `artifacts/${appId}/users/${userId}/categories`), { name });
    } catch (e) { console.error("Error adding category:", e); }
  };
  const addTag = async (name) => {
    if (!db || !userId) return;
    try {
      await addDoc(collection(db, `artifacts/${appId}/users/${userId}/tags`), { name });
    } catch (e) { console.error("Error adding tag:", e); }
  };
  const addProfile = async (name) => {
    if (!db || !userId) return;
    try {
      await addDoc(collection(db, `artifacts/${appId}/users/${userId}/profiles`), { name });
    } catch (e) { console.error("Error adding profile:", e); }
  };

  if (!isAuthReady) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-xl font-semibold text-gray-700">Loading Application...</div>
      </div>
    );
  }

  return (
    <AppContext.Provider
      value={{
        activeProfileId,
        setActiveProfileId,
        items: filteredItems,
        allRawItems: items, // フィルター前の全アイテム (アーカイブやゴミ箱用)
        profiles,
        customCategories,
        customTags,
        userId,
        addItem,
        updateItem,
        deleteItem,
        archiveItem,
        restoreItem,
        addCategory,
        addTag,
        addProfile,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

// コンテキストを使用するためのカスタムフック
export const useAppContext = () => useContext(AppContext);

// components/Header.jsx の内容をここに統合
const Header = ({ onSearchChange }) => {
  const { activeProfileId, setActiveProfileId, profiles, userId } = useAppContext();

  return (
    <header className="flex flex-col sm:flex-row items-center justify-between p-4 bg-white shadow-md rounded-b-lg">
      <div className="flex items-center space-x-2 mb-2 sm:mb-0">
        <span className="text-xl font-bold text-indigo-600">📝 MyApp</span>
      </div>
      <div className="relative w-full sm:w-auto mb-2 sm:mb-0">
        <select
          value={activeProfileId}
          onChange={(e) => setActiveProfileId(e.target.value)}
          className="w-full sm:w-48 px-4 py-2 pr-8 text-gray-700 bg-gray-100 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200 ease-in-out"
        >
          {profiles.map((profile) => (
            <option key={profile.id} value={profile.id}>
              {profile.name}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
          <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 6.757 7.586 5.343 9z" />
          </svg>
        </div>
      </div>
      <div className="text-sm text-gray-500 break-all text-center sm:text-right">
        User ID: <span className="font-mono text-xs text-gray-600">{userId}</span>
      </div>
    </header>
  );
};

// components/Sidebar.jsx の内容をここに統合
const Sidebar = ({ currentPage, onNavigate }) => {
  return (
    <aside className="w-full sm:w-64 p-4 bg-white shadow-lg rounded-r-lg flex flex-col h-full overflow-y-auto sm:overflow-visible">
      <nav className="flex-grow">
        <ul className="space-y-2">
          <li>
            <button
              onClick={() => onNavigate('dashboard')}
              className={`flex items-center p-2 w-full text-left rounded-md transition duration-200 ease-in-out
                ${currentPage === 'dashboard' ? 'bg-indigo-600 text-white' : 'text-gray-700 hover:bg-indigo-100 hover:text-indigo-700'}`}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-9v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
              ダッシュボード
            </button>
          </li>
          <li>
            <button
              onClick={() => onNavigate('items')}
              className={`flex items-center p-2 w-full text-left rounded-md transition duration-200 ease-in-out
                ${currentPage === 'items' ? 'bg-indigo-600 text-white' : 'text-gray-700 hover:bg-indigo-100 hover:text-indigo-700'}`}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path></svg>
              アイテム一覧
            </button>
          </li>
          <li>
            <button
              onClick={() => onNavigate('calendar')}
              className={`flex items-center p-2 w-full text-left rounded-md transition duration-200 ease-in-out
                ${currentPage === 'calendar' ? 'bg-indigo-600 text-white' : 'text-gray-700 hover:bg-indigo-100 hover:text-indigo-700'}`}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
              カレンダー
            </button>
          </li>
          <li>
            <button
              onClick={() => onNavigate('favorites')}
              className={`flex items-center p-2 w-full text-left rounded-md transition duration-200 ease-in-out
                ${currentPage === 'favorites' ? 'bg-indigo-600 text-white' : 'text-gray-700 hover:bg-indigo-100 hover:text-indigo-700'}`}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.329 1.176l1.519 4.674c.3.921-.755 1.688-1.539 1.175l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.513-1.838-.254-1.539-1.175l1.519-4.674a1 1 0 00-.329-1.176l-3.976-2.888c-.784-.57-.381-1.81.588-1.81h4.915a1 1 0 00.95-.69l1.519-4.674z"></path></svg>
              お気に入り
            </button>
          </li>
          <li>
            <button
              onClick={() => onNavigate('archive')}
              className={`flex items-center p-2 w-full text-left rounded-md transition duration-200 ease-in-out
                ${currentPage === 'archive' ? 'bg-indigo-600 text-white' : 'text-gray-700 hover:bg-indigo-100 hover:text-indigo-700'}`}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path></svg>
              アーカイブ
            </button>
          </li>
          <li>
            <button
              onClick={() => onNavigate('trash')}
              className={`flex items-center p-2 w-full text-left rounded-md transition duration-200 ease-in-out
                ${currentPage === 'trash' ? 'bg-indigo-600 text-white' : 'text-gray-700 hover:bg-indigo-100 hover:text-indigo-700'}`}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
              ゴミ箱
            </button>
          </li>
        </ul>
      </nav>

      <div className="mt-8 pt-4 border-t border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">フォルダ</h3>
        <p className="text-sm text-gray-500">（ツリー構造のプレースホルダー）</p>
      </div>
    </aside>
  );
};

// components/ItemCard.jsx の内容をここに統合
const ItemCard = ({ item, onClick, onArchive, onDelete, onFavoriteToggle }) => {
  const statusColors = {
    '未定': 'bg-gray-200 text-gray-700',
    '未着手': 'bg-blue-100 text-blue-700',
    '進行中': 'bg-yellow-100 text-yellow-700',
    '保留': 'bg-orange-100 text-orange-700',
    '完了': 'bg-green-100 text-green-700',
    'アーカイブ': 'bg-purple-100 text-purple-700',
    '削除': 'bg-red-100 text-red-700',
  };

  const priorityColors = {
    '高': 'text-red-500',
    '中': 'text-yellow-500',
    '低': 'text-green-500',
  };

  // moment.js がグローバルスコープにあることを前提
  const moment = window.moment;

  return (
    <div
      className="bg-white rounded-lg shadow-md p-4 mb-4 border border-gray-200 hover:shadow-lg transition duration-200 ease-in-out cursor-pointer flex flex-col"
      onClick={() => onClick(item)}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-semibold text-gray-800 truncate pr-4">{item.title}</h3>
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColors[item.status]}`}>
          {item.status}
        </span>
      </div>

      {item.memo && (
        <p className="text-sm text-gray-600 mb-2 line-clamp-2">{item.memo}</p>
      )}

      <div className="flex flex-wrap items-center text-sm text-gray-500 mb-2">
        {item.category && (
          <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full mr-2 mb-1">
            {item.category}
          </span>
        )}
        {item.tags && item.tags.map(tag => (
          <span key={tag} className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs mr-2 mb-1">
            #{tag}
          </span>
        ))}
      </div>

      {(item.startDate || item.endDate) && (
        <div className="flex items-center text-sm text-gray-500 mb-2">
          <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
          {item.startDate && moment(item.startDate).format('YYYY/MM/DD HH:mm')}
          {item.startDate && item.endDate && ' - '}
          {item.endDate && moment(item.endDate).format('YYYY/MM/DD HH:mm')}
        </div>
      )}

      <div className="flex justify-between items-center mt-auto pt-2 border-t border-gray-100">
        <span className={`text-sm font-medium ${priorityColors[item.priority]}`}>
          優先度: {item.priority}
        </span>
        <div className="flex space-x-2">
          <button
            onClick={(e) => { e.stopPropagation(); onFavoriteToggle(item.id, !item.isFavorite); }}
            className={`p-1 rounded-full text-gray-400 hover:text-yellow-500 transition duration-150 ease-in-out ${item.isFavorite ? 'text-yellow-500' : ''}`}
            title={item.isFavorite ? 'お気に入りから削除' : 'お気に入りに追加'}
          >
            {item.isFavorite ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-star"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-star"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            )}
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onArchive(item.id); }}
            className="p-1 rounded-full text-gray-400 hover:text-purple-500 transition duration-150 ease-in-out"
            title="アーカイブ"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-archive"><rect width="20" height="5" x="2" y="3" rx="1"/><path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8"/><path d="M10 12h4"/></svg>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
            className="p-1 rounded-full text-gray-400 hover:text-red-500 transition duration-150 ease-in-out"
            title="ゴミ箱へ移動"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trash-2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
          </button>
        </div>
      </div>
    </div>
  );
};

// components/ItemDetailModal.jsx の内容をここに統合
const ItemDetailModal = ({ isOpen, onClose, item, onEdit }) => {
  if (!isOpen || !item) return null;

  const statusColors = {
    '未定': 'bg-gray-200 text-gray-700',
    '未着手': 'bg-blue-100 text-blue-700',
    '進行中': 'bg-yellow-100 text-yellow-700',
    '保留': 'bg-orange-100 text-orange-700',
    '完了': 'bg-green-100 text-green-700',
    'アーカイブ': 'bg-purple-100 text-purple-700',
    '削除': 'bg-red-100 text-red-700',
  };

  const priorityColors = {
    '高': 'text-red-600 font-bold',
    '中': 'text-yellow-600 font-bold',
    '低': 'text-green-600 font-bold',
  };

  // moment.js がグローバルスコープにあることを前提
  const moment = window.moment;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto transform transition-all duration-300 scale-100 opacity-100">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4 border-b pb-4">
            <h2 className="text-3xl font-extrabold text-gray-900 leading-tight pr-8">{item.title}</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition duration-150 ease-in-out p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
              aria-label="Close"
            >
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>

          <div className="space-y-4 text-gray-700">
            {item.url && (
              <div>
                <strong className="block text-gray-800 text-sm mb-1">URL:</strong>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:underline break-all"
                >
                  {item.url}
                </a>
              </div>
            )}

            {item.memo && (
              <div>
                <strong className="block text-gray-800 text-sm mb-1">メモ:</strong>
                <p className="whitespace-pre-wrap">{item.memo}</p>
              </div>
            )}

            <div>
              <strong className="block text-gray-800 text-sm mb-1">カテゴリ:</strong>
              <span className="inline-block bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium">
                {item.category || 'なし'}
              </span>
            </div>

            {item.tags && item.tags.length > 0 && (
              <div>
                <strong className="block text-gray-800 text-sm mb-1">タグ:</strong>
                <div className="flex flex-wrap gap-2">
                  {item.tags.map(tag => (
                    <span key={tag} className="inline-block bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {(item.startDate || item.endDate) && (
              <div>
                <strong className="block text-gray-800 text-sm mb-1">スケジュール:</strong>
                <p>
                  {item.startDate && moment(item.startDate).format('YYYY年MM月DD日 HH:mm')}
                  {item.startDate && item.endDate && ' - '}
                  {item.endDate && moment(item.endDate).format('YYYY年MM月DD日 HH:mm')}
                </p>
              </div>
            )}

            {item.remindDate && (
              <div>
                <strong className="block text-gray-800 text-sm mb-1">リマインダー:</strong>
                <p>{moment(item.remindDate).format('YYYY年MM月DD日 HH:mm')}</p>
              </div>
            )}

            <div>
              <strong className="block text-gray-800 text-sm mb-1">ステータス:</strong>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${statusColors[item.status]}`}>
                {item.status}
              </span>
            </div>

            <div>
              <strong className="block text-gray-800 text-sm mb-1">優先度:</strong>
              <span className={`inline-block text-sm ${priorityColors[item.priority]}`}>
                {item.priority}
              </span>
            </div>
          </div>

          <div className="mt-8 flex justify-end space-x-3">
            <button
              onClick={() => { /* onEdit(item.id); */ console.log("編集機能は未実装"); }}
              className="px-6 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition duration-200 ease-in-out shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              編集
            </button>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition duration-200 ease-in-out shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
            >
              閉じる
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// pages/index.js (Dashboard) の内容をここに統合
const DashboardPage = ({ handleItemClick }) => {
  const { items, updateItem, archiveItem, deleteItem } = useAppContext(); // Destructure here

  const handleFavoriteToggle = async (itemId, isFavorite) => {
    await updateItem(itemId, { isFavorite });
  };

  const handleArchive = async (itemId) => {
    await archiveItem(itemId);
  };

  const handleDelete = async (itemId) => {
    await deleteItem(itemId);
  };

  const dashboardStats = {
    totalItems: items.length,
    completedItems: items.filter(item => item.status === '完了').length,
    inProgressItems: items.filter(item => item.status === '進行中').length,
    highPriorityItems: items.filter(item => item.priority === '高').length,
  };

  return (
    <main className="flex-grow p-6 overflow-y-auto">
      <section className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-6">ダッシュボード</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">総アイテム数</h3>
            <p className="text-4xl font-bold text-indigo-600">{dashboardStats.totalItems}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">完了済み</h3>
            <p className="text-4xl font-bold text-green-600">{dashboardStats.completedItems}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">進行中</h3>
            <p className="text-4xl font-bold text-yellow-600">{dashboardStats.inProgressItems}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">高優先度</h3>
            <p className="text-4xl font-bold text-red-600">{dashboardStats.highPriorityItems}</p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">最近のアイテム</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.slice(0, 6).map(item => (
            <ItemCard
              key={item.id}
              item={item}
              onClick={handleItemClick}
              onArchive={handleArchive}
              onDelete={handleDelete}
              onFavoriteToggle={handleFavoriteToggle}
            />
          ))}
        </div>
      </section>
    </main>
  );
};

// pages/items.js (Items List) の内容をここに統合
const ItemsPage = ({ handleItemClick }) => {
  const { items, allRawItems, profiles, updateItem, archiveItem, deleteItem } = useAppContext(); // Destructure here
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterTag, setFilterTag] = useState('');
  const [groupBy, setGroupBy] = useState('status');

  const handleFavoriteToggle = async (itemId, isFavorite) => {
    await updateItem(itemId, { isFavorite });
  };

  const handleArchive = async (itemId) => {
    await archiveItem(itemId);
  };

  const handleDelete = async (itemId) => {
    await deleteItem(itemId);
  };

  // フィルタリングと検索
  const filteredAndSearchedItems = items.filter(item => {
    const matchesSearch = searchTerm === '' ||
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.memo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = filterCategory === '' || item.category === filterCategory;
    const matchesStatus = filterStatus === '' || item.status === filterStatus;
    const matchesPriority = filterPriority === '' || item.priority === filterPriority;
    const matchesTag = filterTag === '' || item.tags?.includes(filterTag);

    return matchesSearch && matchesCategory && matchesStatus && matchesPriority && matchesTag;
  });

  // グループ化ロジック
  const groupedItems = filteredAndSearchedItems.reduce((acc, item) => {
    let groupKey = '未分類';
    if (groupBy === 'status' && item.status) {
      groupKey = item.status;
    } else if (groupBy === 'category' && item.category) {
      groupKey = item.category;
    } else if (groupBy === 'tag' && item.tags && item.tags.length > 0) {
      groupKey = item.tags[0];
    } else if (groupBy === 'profileId' && item.profileId) {
      groupKey = profiles.find(p => p.id === item.profileId)?.name || '未分類プロファイル';
    }

    if (!acc[groupKey]) {
      acc[groupKey] = [];
    }
    acc[groupKey].push(item);
    return acc;
  }, {});

  const sortedGroupKeys = Object.keys(groupedItems).sort((a, b) => {
    if (a === '未分類' || a === '未分類プロファイル') return 1;
    if (b === '未分類' || b === '未分類プロファイル') return -1;
    return a.localeCompare(b);
  });

  const allCategories = [...new Set(allRawItems.map(item => item.category).filter(Boolean))];
  const allTags = [...new Set(allRawItems.flatMap(item => item.tags || []).filter(Boolean))];
  const allStatuses = ['未定', '未着手', '進行中', '保留', '完了', 'アーカイブ', '削除'];
  const allPriorities = ['高', '中', '低'];

  return (
    <main className="flex-grow p-6 overflow-y-auto">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-6">アイテム一覧</h1>

      <div className="bg-white p-6 rounded-xl shadow-md mb-6 flex flex-wrap gap-4 items-center">
        <input
          type="text"
          placeholder="検索..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 min-w-[180px] p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
        />
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="">全てのカテゴリ</option>
          {allCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="">全てのステータス</option>
          {allStatuses.map(status => <option key={status} value={status}>{status}</option>)}
        </select>
        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
          className="p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="">全ての優先度</option>
          {allPriorities.map(prio => <option key={prio} value={prio}>{prio}</option>)}
        </select>
        <select
          value={filterTag}
          onChange={(e) => setFilterTag(e.target.value)}
          className="p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="">全てのタグ</option>
          {allTags.map(tag => <option key={tag} value={tag}>{tag}</option>)}
        </select>
        <select
          value={groupBy}
          onChange={(e) => setGroupBy(e.target.value)}
          className="p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="none">グループ化なし</option>
          <option value="status">ステータスでグループ化</option>
          <option value="category">カテゴリでグループ化</option>
          <option value="tag">タグでグループ化</option>
          <option value="profileId">プロファイルでグループ化</option>
        </select>
      </div>

      {sortedGroupKeys.length === 0 ? (
        <div className="text-center text-gray-500 py-10 text-lg">
          表示するアイテムがありません。
        </div>
      ) : (
        Object.entries(groupedItems).length > 0 && sortedGroupKeys.map(groupKey => (
          <div key={groupKey} className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{groupKey}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {groupedItems[groupKey].map(item => (
                <ItemCard
                  key={item.id}
                  item={item}
                  onClick={handleItemClick}
                  onArchive={handleArchive}
                  onDelete={handleDelete}
                  onFavoriteToggle={handleFavoriteToggle}
                />
              ))}
            </div>
          </div>
        ))
      )}
    </main>
  );
};

// pages/calendar.js の内容をここに統合
const CalendarPage = () => {
  const { items } = useAppContext();
  const moment = window.moment;

  const scheduledItems = items.filter(item => item.startDate || item.endDate);

  return (
    <main className="flex-grow p-6 overflow-y-auto">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-6">カレンダー</h1>
      <div className="bg-white rounded-xl shadow-md p-6 h-[70vh] flex flex-col items-center justify-center text-gray-500 text-lg">
        <p>カレンダー表示のプレースホルダー</p>
        <ul className="mt-4 space-y-2">
          {scheduledItems.length > 0 ? (
            scheduledItems.map(item => (
              <li key={item.id} className="text-sm text-gray-700">
                {item.title} ({item.startDate ? `開始: ${moment(item.startDate).format('YYYY/MM/DD HH:mm')}` : ''}
                {item.endDate ? ` 終了: ${moment(item.endDate).format('YYYY/MM/DD HH:mm')}` : ''})
              </li>
            ))
          ) : (
            <li>スケジュールされたアイテムはありません。</li>
          )}
        </ul>
      </div>
    </main>
  );
};

// pages/favorites.js の内容をここに統合
const FavoritesPage = ({ handleItemClick }) => {
  const { items, updateItem, archiveItem, deleteItem } = useAppContext(); // Destructure here

  const favoriteItems = items.filter(item => item.isFavorite && !item.isDeleted && !item.isArchived);

  const handleFavoriteToggle = async (itemId, isFavorite) => {
    await updateItem(itemId, { isFavorite });
  };

  const handleArchive = async (itemId) => {
    await archiveItem(itemId);
  };

  const handleDelete = async (itemId) => {
    await deleteItem(itemId);
  };

  return (
    <main className="flex-grow p-6 overflow-y-auto">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-6">お気に入り</h1>
      {favoriteItems.length === 0 ? (
        <div className="text-center text-gray-500 py-10 text-lg">
          お気に入りのアイテムはありません。
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {favoriteItems.map(item => (
            <ItemCard
              key={item.id}
              item={item}
              onClick={handleItemClick}
              onArchive={handleArchive}
              onDelete={handleDelete}
              onFavoriteToggle={handleFavoriteToggle}
            />
          ))}
        </div>
      )}
    </main>
  );
};

// pages/archive.js の内容をここに統合
const ArchivePage = ({ handleItemClick }) => {
  const { allRawItems, updateItem, restoreItem, deleteItem } = useAppContext(); // Destructure here

  const archivedItems = allRawItems.filter(item => item.isArchived && !item.isDeleted);

  const handleFavoriteToggle = async (itemId, isFavorite) => {
    await updateItem(itemId, { isFavorite });
  };

  const handleRestore = async (itemId) => {
    await restoreItem(itemId);
  };

  const handleDelete = async (itemId) => {
    await deleteItem(itemId);
  };

  return (
    <main className="flex-grow p-6 overflow-y-auto">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-6">アーカイブ</h1>
      {archivedItems.length === 0 ? (
        <div className="text-center text-gray-500 py-10 text-lg">
          アーカイブされたアイテムはありません。
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {archivedItems.map(item => (
            <ItemCard
              key={item.id}
              item={item}
              onClick={handleItemClick}
              onArchive={handleRestore} // アーカイブページでは復元ボタンとして使用
              onDelete={handleDelete}
              onFavoriteToggle={handleFavoriteToggle}
            />
          ))}
        </div>
      )}
    </main>
  );
};

// pages/trash.js の内容をここに統合
const TrashPage = ({ handleItemClick }) => {
  const { allRawItems, updateItem, restoreItem } = useAppContext(); // Destructure here

  const deletedItems = allRawItems.filter(item => item.isDeleted);

  // 完全に削除する機能も必要に応じて追加
  const handlePermanentDelete = (itemId) => {
    console.log(`アイテム ${itemId} を完全に削除 (現在この機能はモックです)`);
    // TODO: Firestoreから物理的に削除するロジック
  };

  const handleFavoriteToggle = async (itemId, isFavorite) => {
    await updateItem(itemId, { isFavorite });
  };

  const handleRestore = async (itemId) => {
    await restoreItem(itemId);
  };

  return (
    <main className="flex-grow p-6 overflow-y-auto">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-6">ゴミ箱</h1>
      {deletedItems.length === 0 ? (
        <div className="text-center text-gray-500 py-10 text-lg">
          ゴミ箱にアイテムはありません。
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {deletedItems.map(item => (
            <ItemCard
              key={item.id}
              item={item}
              onClick={handleItemClick}
              onArchive={handleRestore} // ゴミ箱では復元ボタンとして使用
              onDelete={handlePermanentDelete} // ゴミ箱では完全に削除するボタンとして使用
              onFavoriteToggle={handleFavoriteToggle}
            />
          ))}
        </div>
      )}
    </main>
  );
};

// メインのAppコンポーネント
const App = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  // Appコンポーネント自体ではこれらの関数を直接使用しないため、ここでdestructureしない

  const handleNavigate = (page) => {
    setCurrentPage(page);
  };

  const handleItemClick = (item) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
  };

  const renderPage = () => {
    // 各ページコンポーネントで useAppContext を呼び出し、必要な関数をdestructureする
    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage handleItemClick={handleItemClick} />;
      case 'items':
        return <ItemsPage handleItemClick={handleItemClick} />;
      case 'calendar':
        return <CalendarPage />;
      case 'favorites':
        return <FavoritesPage handleItemClick={handleItemClick} />;
      case 'archive':
        return <ArchivePage handleItemClick={handleItemClick} />;
      case 'trash':
        return <TrashPage handleItemClick={handleItemClick} />;
      default:
        return (
          <div className="flex-grow p-6 text-center text-gray-500">
            ページが見つかりません。
          </div>
        );
    }
  };

  return (
    <AppProvider> {/* AppProviderがアプリケーション全体をラップする */}
      <div className="flex flex-col h-screen bg-gray-100 font-sans antialiased">
        <Header /> {/* Headerは内部でuseAppContextを呼び出す */}
        <div className="flex flex-grow overflow-hidden flex-col sm:flex-row">
          <Sidebar currentPage={currentPage} onNavigate={handleNavigate} />
          {renderPage()} {/* renderPageはJSX要素を返す */}
          <ItemDetailModal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            item={selectedItem}
          />
        </div>
      </div>
    </AppProvider>
  );
};

export default App;
