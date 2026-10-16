import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInAnonymously, 
  signInWithCustomToken, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot 
} from 'firebase/firestore';
import { 
  Package, 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  XCircle, 
  Settings, 
  ClipboardList, 
  ShieldAlert, 
  UserCheck, 
  Sparkles, 
  Sliders, 
  MapPin, 
  Calendar, 
  Layers, 
  Info, 
  RefreshCw, 
  Check, 
  X, 
  CornerDownLeft, 
  Volume2, 
  Video, 
  Music, 
  Sun, 
  Cable, 
  Eye, 
  EyeOff,
  Megaphone,
  ChevronRight,
  ArrowUpRight,
  Filter
} from 'lucide-react';

// ==========================================
// FIREBASE INITIALIZATION
// ==========================================
const firebaseConfig = typeof firebaseConfig !== 'undefined' ? JSON.parse(firebaseConfig) : {};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'ifgf-production-inventory';

// ==========================================
// INITIAL PRESET DATA
// ==========================================
const DEFAULT_SETTINGS = {
  portalTitle: 'IFGF Production Inventory',
  portalSubtitle: 'Inventory Management',
  themeColor: 'indigo', // indigo, emerald, amber, rose, slate
  showStats: true,
  showAnnouncement: true,
  allowNewRequests: true,
  showStorageToUsers: true,
  announcementTitle: 'SOP Peminjaman & Pengembalian Alat Produksi',
  announcementText: 'Harap mengajukan request minimal H-2 sebelum penggunaan. Pastikan seluruh kabel digulung rapi (teknik over-under) dan baterai wireless dilepas setelah selesai penggunaan.',
  categories: [
    'Video & Kamera',
    'Lighting',
    'Kabel & Aksesoris'
  ],
  eventsList: [
    'IFGF Super Sunday',
    'IFGF TYC',
    'IFGF Kids',
    'Saturday Prayer',
    'Media/Shooting Whats On',
    'Conference'
  ]
};

const INITIAL_INVENTORY = [
  {
    name: 'Roland RD-700GX Stage Piano',
    serialNumber: 'IFGF-MUS-001',
    category: 'Musik & Instrument',
    condition: 'Baik',
    status: 'Tersedia',
    quantity: 1,
    location: 'Panggung Utama - Altar Kiri',
    notes: 'Termasuk sustain pedal Roland DP-10 dan hardcase.'
  },
  {
    name: 'Neumann KM 184 Condenser Mic (Stereo Pair)',
    serialNumber: 'IFGF-AUD-002',
    category: 'Audio & Sound',
    condition: 'Baik',
    status: 'Tersedia',
    quantity: 2,
    location: 'Lemari Besi Audio - Rak A1',
    notes: 'Gunakan untuk overhead drum atau akustik. Wajib pakai phantom power +48V.'
  },
  {
    name: 'Behringer WING 48-Channel Digital Mixer',
    serialNumber: 'IFGF-AUD-001',
    category: 'Audio & Sound',
    condition: 'Baik',
    status: 'Tersedia',
    quantity: 1,
    location: 'Booth FOH Utama',
    notes: 'Jangan ubah routing Dante tanpa izin Koordinator Sound.'
  },
  {
    name: 'Shure ULXD4 Digital Wireless Receiver + Beta 58A',
    serialNumber: 'IFGF-AUD-005',
    category: 'Audio & Sound',
    condition: 'Baik',
    status: 'Dipinjam',
    quantity: 4,
    location: 'Rack Wireless FOH',
    notes: 'Mic Worship Leader & Pastor. Baterai rechargeable Shure SB900B.'
  },
  {
    name: 'Sony Alpha A7S III Mirrorless Camera',
    serialNumber: 'IFGF-VID-001',
    category: 'Video & Kamera',
    condition: 'Baik',
    status: 'Tersedia',
    quantity: 2,
    location: 'Dry Cabinet Multimedia #1',
    notes: 'Termasuk lensa Sony FE 24-70mm f/2.8 GM & 2 baterai NP-FZ100.'
  },
  {
    name: 'Blackmagic ATEM Constellation 2 M/E Switcher',
    serialNumber: 'IFGF-VID-003',
    category: 'Video & Kamera',
    condition: 'Baik',
    status: 'Tersedia',
    quantity: 1,
    location: 'Ruang Broadcast / Multimedia',
    notes: 'Terhubung ke ATEM 1 M/E Advanced Panel.'
  },
  {
    name: 'Fender American Professional II Jazz Bass',
    serialNumber: 'IFGF-MUS-004',
    category: 'Musik & Instrument',
    condition: 'Baik',
    status: 'Tersedia',
    quantity: 1,
    location: 'Ruang Penyimpanan Alat Musik - Stand B',
    notes: 'Senar Elixir baru diganti bulan lalu.'
  },
  {
    name: 'Sennheiser EW IEM G4 In-Ear Monitor System',
    serialNumber: 'IFGF-AUD-009',
    category: 'Audio & Sound',
    condition: 'Perlu Perbaikan',
    status: 'Maintenance',
    quantity: 6,
    location: 'Gudang Audio - Meja Servis',
    notes: '1 unit bodypack antena agak longgar, sedang diperbaiki.'
  },
  {
    name: 'Kabel XLR Canare L-2T2S + Neutrik (10 Meter)',
    serialNumber: 'IFGF-ACC-012',
    category: 'Kabel & Aksesoris',
    condition: 'Baik',
    status: 'Tersedia',
    quantity: 25,
    location: 'Box Kontainer Kabel #2',
    notes: 'Warna hitam dengan velcro strap berlabel IFGF.'
  },
  {
    name: 'Moving Head Beam 230W 7R',
    serialNumber: 'IFGF-LGT-004',
    category: 'Lighting & Panggung',
    condition: 'Baik',
    status: 'Tersedia',
    quantity: 8,
    location: 'Truss Panggung & Gudang Lighting',
    notes: '6 terpasang di rig atas, 2 unit floor stand.'
  }
];

// ==========================================
// THEME PALETTE HELPER
// ==========================================
const THEME_CONFIG = {
  indigo: {
    name: 'Indigo Modern',
    bgPrimary: 'bg-indigo-600',
    bgHover: 'hover:bg-indigo-700',
    textPrimary: 'text-indigo-600',
    borderPrimary: 'border-indigo-600',
    bgSoft: 'bg-indigo-50',
    textSoft: 'text-indigo-800',
    borderSoft: 'border-indigo-200',
    ringFocus: 'focus:ring-indigo-500',
    gradient: 'from-indigo-600 to-blue-700',
    badge: 'bg-indigo-100 text-indigo-700'
  },
  emerald: {
    name: 'Emerald Green',
    bgPrimary: 'bg-emerald-600',
    bgHover: 'hover:bg-emerald-700',
    textPrimary: 'text-emerald-600',
    borderPrimary: 'border-emerald-600',
    bgSoft: 'bg-emerald-50',
    textSoft: 'text-emerald-800',
    borderSoft: 'border-emerald-200',
    ringFocus: 'focus:ring-emerald-500',
    gradient: 'from-emerald-600 to-teal-700',
    badge: 'bg-emerald-100 text-emerald-700'
  },
  amber: {
    name: 'Amber Gold',
    bgPrimary: 'bg-amber-600',
    bgHover: 'hover:bg-amber-700',
    textPrimary: 'text-amber-600',
    borderPrimary: 'border-amber-600',
    bgSoft: 'bg-amber-50',
    textSoft: 'text-amber-900',
    borderSoft: 'border-amber-200',
    ringFocus: 'focus:ring-amber-500',
    gradient: 'from-amber-600 to-orange-700',
    badge: 'bg-amber-100 text-amber-800'
  },
  rose: {
    name: 'Crimson Rose',
    bgPrimary: 'bg-rose-600',
    bgHover: 'hover:bg-rose-700',
    textPrimary: 'text-rose-600',
    borderPrimary: 'border-rose-600',
    bgSoft: 'bg-rose-50',
    textSoft: 'text-rose-800',
    borderSoft: 'border-rose-200',
    ringFocus: 'focus:ring-rose-500',
    gradient: 'from-rose-600 to-pink-700',
    badge: 'bg-rose-100 text-rose-700'
  },
  slate: {
    name: 'Executive Slate',
    bgPrimary: 'bg-slate-800',
    bgHover: 'hover:bg-slate-900',
    textPrimary: 'text-slate-800',
    borderPrimary: 'border-slate-800',
    bgSoft: 'bg-slate-100',
    textSoft: 'text-slate-800',
    borderSoft: 'border-slate-300',
    ringFocus: 'focus:ring-slate-600',
    gradient: 'from-slate-800 to-slate-950',
    badge: 'bg-slate-200 text-slate-800'
  }
};

export default function App() {
  // Auth & User State
  const [user, setUser] = useState(null);
  const [role, setRole] = useState('superadmin'); // 'user' or 'superadmin'
  const [crewName, setCrewName] = useState('Tim Produksi IFGF');
  const [loading, setLoading] = useState(true);

  // Navigation State
  const [activeTab, setActiveTab] = useState('inventory'); // 'inventory', 'requests', 'manage-requests', 'customizer'

  // Firestore Data States
  const [inventory, setInventory] = useState([]);
  const [requests, setRequests] = useState([]);
  const [pageConfig, setPageConfig] = useState(DEFAULT_SETTINGS);
  const [isSeeding, setIsSeeding] = useState(false);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [selectedStatus, setSelectedStatus] = useState('Semua');

  // Modals & Notification State
  const [toast, setToast] = useState(null);
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteConfirmItem, setDeleteConfirmItem] = useState(null);
  const [requestModalOpen, setRequestModalOpen] = useState(false);

  // Form State for Inventory Item CRUD
  const [itemForm, setItemForm] = useState({
    name: '',
    serialNumber: '',
    category: 'Audio & Sound',
    condition: 'Baik',
    status: 'Tersedia',
    quantity: 1,
    location: '',
    notes: ''
  });

  // Form State for Borrowing Request
  const [requestForm, setRequestForm] = useState({
    itemId: '',
    itemName: '',
    borrowerName: '',
    ministryTeam: 'Ibadah Raya Minggu',
    quantity: 1,
    borrowDate: new Date().toISOString().split('T')[0],
    returnDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    purpose: ''
  });

  // Form State for Customizer new category
  const [newCategoryInput, setNewCategoryInput] = useState('');

  // Show temporary notification
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  // ==========================================
  // 1. FIREBASE AUTHENTICATION
  // ==========================================
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) {
        console.error('Authentication Error:', err);
      }
    };
    initAuth();

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // ==========================================
  // 2. REAL-TIME FIRESTORE LISTENERS
  // ==========================================
  useEffect(() => {
    if (!user) return;

    // A. Listen to Inventory Collection
    const invColRef = collection(db, 'artifacts', appId, 'public', 'data', 'inventory');
    const unsubInventory = onSnapshot(
      invColRef,
      async (snapshot) => {
        const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        if (items.length === 0 && !isSeeding) {
          // Seed initial production gear if empty
          setIsSeeding(true);
          try {
            for (const item of INITIAL_INVENTORY) {
              await addDoc(invColRef, {
                ...item,
                createdAt: new Date().toISOString()
              });
            }
          } catch (e) {
            console.error('Error seeding initial inventory:', e);
          }
        } else {
          items.sort((a, b) => a.name.localeCompare(b.name));
          setInventory(items);
          setLoading(false);
        }
      },
      (err) => {
        console.error('Inventory Snapshot Error:', err);
        setLoading(false);
      }
    );

    // B. Listen to Requests Collection
    const reqColRef = collection(db, 'artifacts', appId, 'public', 'data', 'requests');
    const unsubRequests = onSnapshot(
      reqColRef,
      (snapshot) => {
        const reqs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        reqs.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
        setRequests(reqs);
      },
      (err) => console.error('Requests Snapshot Error:', err)
    );

    // C. Listen to Page Customizer Config
    const configDocRef = doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'pageConfig');
    const unsubConfig = onSnapshot(
      configDocRef,
      async (docSnap) => {
        if (docSnap.exists()) {
          setPageConfig({ ...DEFAULT_SETTINGS, ...docSnap.data() });
        } else {
          try {
            await setDoc(configDocRef, DEFAULT_SETTINGS);
          } catch (e) {
            console.error('Error initializing config:', e);
          }
        }
      },
      (err) => console.error('Config Snapshot Error:', err)
    );

    // D. Listen to User Profile Role
    const userDocRef = doc(db, 'artifacts', appId, 'users', user.uid, 'profile', 'info');
    const unsubUser = onSnapshot(
      userDocRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.role) setRole(data.role);
          if (data.crewName) setCrewName(data.crewName);
        }
      },
      (err) => console.error('User Profile Snapshot Error:', err)
    );

    return () => {
      unsubInventory();
      unsubRequests();
      unsubConfig();
      unsubUser();
    };
  }, [user]);

  // Role switching handler (persisted to Firestore)
  const handleRoleSwitch = async (newRole) => {
    setRole(newRole);
    if (newRole === 'user' && (activeTab === 'manage-requests' || activeTab === 'customizer')) {
      setActiveTab('inventory');
    }
    showToast(
      `Mode akses diubah menjadi: ${newRole === 'superadmin' ? 'Superadmin (Akses Penuh)' : 'User / Crew Pelayanan'}`,
      'info'
    );
    if (user) {
      try {
        const userDocRef = doc(db, 'artifacts', appId, 'users', user.uid, 'profile', 'info');
        await setDoc(userDocRef, { role: newRole, crewName, updatedAt: new Date().toISOString() }, { merge: true });
      } catch (e) {
        console.error('Failed saving role:', e);
      }
    }
  };

  // ==========================================
  // 3. INVENTORY CRUD OPERATIONS
  // ==========================================
  const openAddModal = () => {
    setEditingItem(null);
    setItemForm({
      name: '',
      serialNumber: `IFGF-${Math.floor(100 + Math.random() * 900)}`,
      category: pageConfig.categories[0] || 'Audio & Sound',
      condition: 'Baik',
      status: 'Tersedia',
      quantity: 1,
      location: '',
      notes: ''
    });
    setItemModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setItemForm({
      name: item.name || '',
      serialNumber: item.serialNumber || '',
      category: item.category || 'Audio & Sound',
      condition: item.condition || 'Baik',
      status: item.status || 'Tersedia',
      quantity: item.quantity || 1,
      location: item.location || '',
      notes: item.notes || ''
    });
    setItemModalOpen(true);
  };

  const handleSaveItem = async (e) => {
    e.preventDefault();
    if (!user) return;
    if (!itemForm.name.trim()) {
      showToast('Nama peralatan wajib diisi!', 'error');
      return;
    }

    try {
      const invColRef = collection(db, 'artifacts', appId, 'public', 'data', 'inventory');
      if (editingItem) {
        const itemRef = doc(db, 'artifacts', appId, 'public', 'data', 'inventory', editingItem.id);
        await updateDoc(itemRef, {
          ...itemForm,
          quantity: Number(itemForm.quantity) || 1,
          updatedAt: new Date().toISOString()
        });
        showToast(`Data "${itemForm.name}" berhasil diperbarui!`);
      } else {
        await addDoc(invColRef, {
          ...itemForm,
          quantity: Number(itemForm.quantity) || 1,
          createdAt: new Date().toISOString()
        });
        showToast(`Alat "${itemForm.name}" berhasil ditambahkan ke database!`);
      }
      setItemModalOpen(false);
    } catch (err) {
      console.error('Save item error:', err);
      showToast('Gagal menyimpan data peralatan.', 'error');
    }
  };

  const handleConfirmDelete = async () => {
    if (!user || !deleteConfirmItem) return;
    try {
      const itemRef = doc(db, 'artifacts', appId, 'public', 'data', 'inventory', deleteConfirmItem.id);
      await deleteDoc(itemRef);
      showToast(`"${deleteConfirmItem.name}" telah dihapus dari inventaris.`);
      setDeleteConfirmItem(null);
    } catch (err) {
      console.error('Delete error:', err);
      showToast('Gagal menghapus peralatan.', 'error');
    }
  };

  // ==========================================
  // 4. EQUIPMENT REQUEST OPERATIONS
  // ==========================================
  const openRequestModal = (item = null) => {
    if (!pageConfig.allowNewRequests && role !== 'superadmin') {
      showToast('Pengajuan request baru sedang ditutup sementara oleh Admin.', 'error');
      return;
    }
    const defaultItem = item || inventory.find((i) => i.status === 'Tersedia') || inventory[0];
    setRequestForm({
      itemId: defaultItem ? defaultItem.id : '',
      itemName: defaultItem ? defaultItem.name : '',
      borrowerName: crewName || '',
      ministryTeam: pageConfig.eventsList?.[0] || 'Ibadah Raya Minggu',
      quantity: 1,
      borrowDate: new Date().toISOString().split('T')[0],
      returnDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      purpose: ''
    });
    setRequestModalOpen(true);
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    if (!user) return;

    const selectedItem = inventory.find((i) => i.id === requestForm.itemId);
    const itemName = selectedItem ? selectedItem.name : requestForm.itemName;

    if (!itemName || !requestForm.borrowerName.trim()) {
      showToast('Harap lengkapi nama peminjam dan alat yang dipilih.', 'error');
      return;
    }

    try {
      const reqColRef = collection(db, 'artifacts', appId, 'public', 'data', 'requests');
      await addDoc(reqColRef, {
        ...requestForm,
        itemName,
        quantity: Number(requestForm.quantity) || 1,
        requesterId: user.uid,
        status: 'Menunggu Persetujuan',
        createdAt: new Date().toISOString()
      });

      setCrewName(requestForm.borrowerName);
      setRequestModalOpen(false);
      showToast('Permintaan peminjaman alat berhasil dikirim!');
      setActiveTab('requests');
    } catch (err) {
      console.error('Submit request error:', err);
      showToast('Gagal mengirim permintaan peminjaman.', 'error');
    }
  };

  const handleUpdateRequestStatus = async (reqItem, newStatus) => {
    if (!user) return;
    try {
      const reqRef = doc(db, 'artifacts', appId, 'public', 'data', 'requests', reqItem.id);
      await updateDoc(reqRef, {
        status: newStatus,
        processedBy: crewName,
        updatedAt: new Date().toISOString()
      });

      // Sync item status in inventory automatically
      if (reqItem.itemId) {
        const invRef = doc(db, 'artifacts', appId, 'public', 'data', 'inventory', reqItem.itemId);
        if (newStatus === 'Disetujui') {
          await updateDoc(invRef, { status: 'Dipinjam' });
        } else if (newStatus === 'Selesai / Dikembalikan') {
          await updateDoc(invRef, { status: 'Tersedia' });
        }
      }

      showToast(`Status request diubah menjadi: ${newStatus}`);
    } catch (err) {
      console.error('Update request status error:', err);
      showToast('Gagal memperbarui status request.', 'error');
    }
  };

  const handleDeleteRequest = async (reqId) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'requests', reqId));
      showToast('Riwayat request berhasil dihapus.');
    } catch (err) {
      console.error('Error deleting request:', err);
    }
  };

  // ==========================================
  // 5. SUPERADMIN PAGE CUSTOMIZER OPERATIONS
  // ==========================================
  const handleUpdateConfig = async (updatedFields) => {
    if (!user || role !== 'superadmin') return;
    const newConfig = { ...pageConfig, ...updatedFields };
    setPageConfig(newConfig);
    try {
      const configDocRef = doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'pageConfig');
      await setDoc(configDocRef, newConfig, { merge: true });
      showToast('Kustomisasi halaman berhasil disimpan secara real-time!');
    } catch (err) {
      console.error('Update config error:', err);
      showToast('Gagal menyimpan pengaturan halaman.', 'error');
    }
  };

  const handleAddCategory = () => {
    const trimmed = newCategoryInput.trim();
    if (!trimmed) return;
    if (pageConfig.categories.includes(trimmed)) {
      showToast('Kategori tersebut sudah ada!', 'error');
      return;
    }
    const updated = [...pageConfig.categories, trimmed];
    handleUpdateConfig({ categories: updated });
    setNewCategoryInput('');
  };

  const handleRemoveCategory = (catToRemove) => {
    if (pageConfig.categories.length <= 1) {
      showToast('Minimal harus ada 1 kategori aktif.', 'error');
      return;
    }
    const updated = pageConfig.categories.filter((c) => c !== catToRemove);
    handleUpdateConfig({ categories: updated });
  };

  // ==========================================
  // COMPUTED & FILTERED DATA
  // ==========================================
  const theme = THEME_CONFIG[pageConfig.themeColor] || THEME_CONFIG.indigo;

  const filteredInventory = useMemo(() => {
    return inventory.filter((item) => {
      const matchesSearch =
        item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.serialNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.notes?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = selectedCategory === 'Semua' || item.category === selectedCategory;
      const matchesStatus = selectedStatus === 'Semua' || item.status === selectedStatus;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [inventory, searchQuery, selectedCategory, selectedStatus]);

  const stats = useMemo(() => {
    const totalItems = inventory.length;
    const totalUnits = inventory.reduce((acc, curr) => acc + (Number(curr.quantity) || 1), 0);
    const available = inventory.filter((i) => i.status === 'Tersedia').length;
    const borrowed = inventory.filter((i) => i.status === 'Dipinjam').length;
    const maintenance = inventory.filter((i) => i.status === 'Maintenance' || i.condition !== 'Baik').length;
    const pendingRequests = requests.filter((r) => r.status === 'Menunggu Persetujuan').length;
    return { totalItems, totalUnits, available, borrowed, maintenance, pendingRequests };
  }, [inventory, requests]);

  const getCategoryIcon = (category) => {
    const lower = (category || '').toLowerCase();
    if (lower.includes('audio') || lower.includes('sound')) return <Volume2 className="w-4 h-4" />;
    if (lower.includes('musik') || lower.includes('instrument')) return <Music className="w-4 h-4" />;
    if (lower.includes('video') || lower.includes('kamera')) return <Video className="w-4 h-4" />;
    if (lower.includes('lighting') || lower.includes('panggung')) return <Sun className="w-4 h-4" />;
    if (lower.includes('kabel') || lower.includes('aksesoris')) return <Cable className="w-4 h-4" />;
    return <Package className="w-4 h-4" />;
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Tersedia':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Tersedia
          </span>
        );
      case 'Dipinjam':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
            Dipinjam
          </span>
        );
      case 'Maintenance':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
            Maintenance
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
            {status}
          </span>
        );
    }
  };

  const getRequestStatusBadge = (status) => {
    switch (status) {
      case 'Menunggu Persetujuan':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            <Clock className="w-3.5 h-3.5" />
            Menunggu Persetujuan
          </span>
        );
      case 'Disetujui':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Disetujui (Sedang Dipinjam)
          </span>
        );
      case 'Selesai / Dikembalikan':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <Check className="w-3.5 h-3.5" />
            Selesai / Dikembalikan
          </span>
        );
      case 'Ditolak':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">
            <XCircle className="w-3.5 h-3.5" />
            Ditolak
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* TOAST NOTIFICATION */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border bg-white border-slate-200 transition-all duration-300 max-w-md">
          {toast.type === 'error' ? (
            <div className="p-1.5 rounded-lg bg-rose-100 text-rose-600">
              <AlertTriangle className="w-5 h-5" />
            </div>
          ) : toast.type === 'info' ? (
            <div className={`p-1.5 rounded-lg ${theme.bgSoft} ${theme.textPrimary}`}>
              <Info className="w-5 h-5" />
            </div>
          ) : (
            <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          )}
          <p className="text-sm font-medium text-slate-800">{toast.message}</p>
          <button onClick={() => setToast(null)} className="ml-auto text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* TOP HEADER & ROLE SWITCHER */}
      <header className={`bg-gradient-to-r ${theme.gradient} text-white shadow-md sticky top-0 z-30`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between py-4 gap-4">
            {/* Brand Title (Customizable by Superadmin) */}
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/25 shadow-inner shrink-0">
                <Layers className="w-7 h-7 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                    {pageConfig.portalTitle}
                  </h1>
                  <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-white/20 text-white backdrop-blur-sm">
                    LIVE DB
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-white/80 line-clamp-1">
                  {pageConfig.portalSubtitle}
                </p>
              </div>
            </div>

            {/* Interactive Role Switcher for Demo & Testing */}
            <div className="flex items-center justify-between md:justify-end gap-3 bg-black/20 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/15">
              <div className="text-xs">
                <span className="text-white/70 block">Mode Akses Aktif:</span>
                <span className="font-semibold text-white flex items-center gap-1">
                  {role === 'superadmin' ? (
                    <>
                      <ShieldAlert className="w-3.5 h-3.5 text-amber-300" />
                      Superadmin
                    </>
                  ) : (
                    <>
                      <UserCheck className="w-3.5 h-3.5 text-emerald-300" />
                      User / Crew
                    </>
                  )}
                </span>
              </div>

              <div className="flex bg-white/10 p-1 rounded-lg border border-white/10">
                <button
                  onClick={() => handleRoleSwitch('user')}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                    role === 'user'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-white/80 hover:text-white'
                  }`}
                >
                  User (Crew)
                </button>
                <button
                  onClick={() => handleRoleSwitch('superadmin')}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1 ${
                    role === 'superadmin'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-white/80 hover:text-white'
                  }`}
                >
                  Superadmin
                </button>
              </div>
            </div>
          </div>

          {/* NAVIGATION TABS */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pt-1 border-t border-white/15">
            <button
              onClick={() => setActiveTab('inventory')}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                activeTab === 'inventory'
                  ? 'border-white text-white bg-white/10 rounded-t-lg'
                  : 'border-transparent text-white/75 hover:text-white hover:bg-white/5 rounded-t-lg'
              }`}
            >
              <Package className="w-4 h-4" />
              Katalog Inventaris
              <span className="px-2 py-0.5 text-xs rounded-full bg-white/20 text-white">
                {inventory.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('requests')}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                activeTab === 'requests'
                  ? 'border-white text-white bg-white/10 rounded-t-lg'
                  : 'border-transparent text-white/75 hover:text-white hover:bg-white/5 rounded-t-lg'
              }`}
            >
              <ClipboardList className="w-4 h-4" />
              Request Peminjaman
              <span className="px-2 py-0.5 text-xs rounded-full bg-white/20 text-white">
                {requests.length}
              </span>
            </button>

            {role === 'superadmin' && (
              <>
                <button
                  onClick={() => setActiveTab('manage-requests')}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                    activeTab === 'manage-requests'
                      ? 'border-white text-white bg-white/10 rounded-t-lg'
                      : 'border-transparent text-white/75 hover:text-white hover:bg-white/5 rounded-t-lg'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Kelola Request (Admin)
                  {stats.pendingRequests > 0 && (
                    <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-amber-400 text-slate-950 animate-pulse">
                      {stats.pendingRequests} Baru
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setActiveTab('customizer')}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                    activeTab === 'customizer'
                      ? 'border-white text-white bg-white/10 rounded-t-lg'
                      : 'border-transparent text-white/75 hover:text-white hover:bg-white/5 rounded-t-lg'
                  }`}
                >
                  <Sliders className="w-4 h-4" />
                  Kustomisasi Halaman
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* CUSTOMIZABLE SOP / ANNOUNCEMENT BANNER */}
        {pageConfig.showAnnouncement && (
          <div className={`${theme.bgSoft} border ${theme.borderSoft} rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm`}>
            <div className="flex items-start gap-3.5">
              <div className={`p-2.5 rounded-xl ${theme.bgPrimary} text-white shrink-0 mt-0.5`}>
                <Megaphone className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className={`text-sm sm:text-base font-bold ${theme.textSoft}`}>
                    {pageConfig.announcementTitle}
                  </h2>
                  {role === 'superadmin' && (
                    <button
                      onClick={() => setActiveTab('customizer')}
                      className="text-xs underline opacity-75 hover:opacity-100 flex items-center gap-0.5"
                    >
                      Edit Banner
                    </button>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-slate-700 mt-1 leading-relaxed">
                  {pageConfig.announcementText}
                </p>
              </div>
            </div>
            {pageConfig.allowNewRequests && (
              <button
                onClick={() => openRequestModal()}
                className={`shrink-0 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white ${theme.bgPrimary} ${theme.bgHover} shadow-sm transition flex items-center gap-2`}
              >
                <Calendar className="w-4 h-4" />
                Ajukan Peminjaman Alat
              </button>
            )}
          </div>
        )}

        {/* SUMMARY STATS CARDS (Customizable visibility) */}
        {pageConfig.showStats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Jenis Alat</p>
                <p className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">{stats.totalItems}</p>
                <p className="text-xs text-slate-500 mt-1">Total {stats.totalUnits} unit terdaftar</p>
              </div>
              <div className={`w-12 h-12 rounded-2xl ${theme.bgSoft} ${theme.textPrimary} flex items-center justify-center`}>
                <Package className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Siap Digunakan</p>
                <p className="text-2xl sm:text-3xl font-bold text-emerald-600 mt-1">{stats.available}</p>
                <p className="text-xs text-emerald-600/80 mt-1">Tersedia di penyimpanan</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Sedang Dipinjam</p>
                <p className="text-2xl sm:text-3xl font-bold text-amber-600 mt-1">{stats.borrowed}</p>
                <p className="text-xs text-amber-600/80 mt-1">{stats.pendingRequests} request menunggu</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Clock className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Perlu Maintenance</p>
                <p className="text-2xl sm:text-3xl font-bold text-rose-600 mt-1">{stats.maintenance}</p>
                <p className="text-xs text-rose-600/80 mt-1">Servis / Perbaikan</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6" />
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 1: KATALOG INVENTARIS (FULL CRUD & REQUEST TRIGGER) */}
        {/* ========================================================= */}
        {activeTab === 'inventory' && (
          <div className="space-y-5">
            {/* Action Bar: Search, Filters & Add Button */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
                {/* Search Input */}
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari nama alat, kode serial, atau lokasi rak..."
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Category Filter */}
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-slate-400 hidden sm:block" />
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:bg-white"
                  >
                    <option value="Semua">Semua Kategori</option>
                    {pageConfig.categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>

                  {/* Status Filter */}
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:bg-white"
                  >
                    <option value="Semua">Semua Status</option>
                    <option value="Tersedia">Tersedia</option>
                    <option value="Dipinjam">Sedang Dipinjam</option>
                    <option value="Maintenance">Maintenance</option>
                  </select>
                </div>
              </div>

              {/* Action Buttons based on Role */}
              <div className="flex items-center gap-2.5 justify-end">
                {role === 'superadmin' && (
                  <button
                    onClick={openAddModal}
                    className={`px-4 py-2.5 rounded-xl text-sm font-semibold text-white ${theme.bgPrimary} ${theme.bgHover} shadow-sm transition flex items-center gap-2`}
                  >
                    <Plus className="w-4 h-4" />
                    Tambah Alat Baru
                  </button>
                )}
              </div>
            </div>

            {/* Category Quick Pills */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
              <button
                onClick={() => setSelectedCategory('Semua')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition whitespace-nowrap ${
                  selectedCategory === 'Semua'
                    ? `${theme.bgPrimary} text-white shadow-sm`
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                Semua Alat ({inventory.length})
              </button>
              {pageConfig.categories.map((cat) => {
                const count = inventory.filter((i) => i.category === cat).length;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition whitespace-nowrap ${
                      selectedCategory === cat
                        ? `${theme.bgPrimary} text-white shadow-sm`
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {getCategoryIcon(cat)}
                    {cat} ({count})
                  </button>
                );
              })}
            </div>

            {/* Inventory Grid / Cards */}
            {loading ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                <RefreshCw className="w-8 h-8 text-slate-400 animate-spin mx-auto mb-3" />
                <p className="text-sm font-medium text-slate-600">Memuat database inventaris produksi IFGF...</p>
              </div>
            ) : filteredInventory.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto">
                <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-800">Tidak Ada Alat Ditemukan</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Coba ubah kata kunci pencarian atau reset filter kategori di atas.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('Semua');
                    setSelectedStatus('Semua');
                  }}
                  className={`mt-4 px-4 py-2 rounded-xl text-xs font-semibold text-white ${theme.bgPrimary}`}
                >
                  Reset Filter
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredInventory.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl border border-slate-200/90 hover:border-slate-300 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
                  >
                    <div className="p-5 space-y-3.5">
                      {/* Top Row: Category Badge & Status */}
                      <div className="flex items-center justify-between gap-2">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${theme.badge}`}>
                          {getCategoryIcon(item.category)}
                          {item.category}
                        </span>
                        {getStatusBadge(item.status)}
                      </div>

                      {/* Equipment Name & Serial */}
                      <div>
                        <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors leading-snug">
                          {item.name}
                        </h3>
                        <p className="text-xs font-mono text-slate-400 mt-0.5">
                          SN/Kode: {item.serialNumber || '-'}
                        </p>
                      </div>

                      {/* Metadata: Quantity, Condition, Location */}
                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                        <div className="bg-slate-50 p-2 rounded-lg">
                          <span className="text-slate-400 block text-[11px]">Jumlah Unit</span>
                          <span className="font-bold text-slate-800">{item.quantity} Unit</span>
                        </div>
                        <div className="bg-slate-50 p-2 rounded-lg">
                          <span className="text-slate-400 block text-[11px]">Kondisi Fisik</span>
                          <span
                            className={`font-bold ${
                              item.condition === 'Baik'
                                ? 'text-emerald-600'
                                : item.condition === 'Perlu Perbaikan'
                                ? 'text-amber-600'
                                : 'text-rose-600'
                            }`}
                          >
                            {item.condition}
                          </span>
                        </div>
                      </div>

                      {/* Storage Location (Can be hidden from regular users by Superadmin) */}
                      {(pageConfig.showStorageToUsers || role === 'superadmin') && item.location && (
                        <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50/80 px-3 py-2 rounded-xl border border-slate-100">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate font-medium">{item.location}</span>
                        </div>
                      )}

                      {/* Notes */}
                      {item.notes && (
                        <p className="text-xs text-slate-500 italic line-clamp-2 bg-amber-50/40 p-2.5 rounded-xl border border-amber-100/60">
                          "{item.notes}"
                        </p>
                      )}
                    </div>

                    {/* Card Footer Actions */}
                    <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                      {/* User Request Button */}
                      {item.status === 'Tersedia' && pageConfig.allowNewRequests ? (
                        <button
                          onClick={() => openRequestModal(item)}
                          className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold text-white ${theme.bgPrimary} ${theme.bgHover} transition flex items-center justify-center gap-1.5 shadow-sm`}
                        >
                          <ArrowUpRight className="w-3.5 h-3.5" />
                          Request Pinjam
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400 font-medium py-1.5">
                          {item.status !== 'Tersedia' ? 'Tidak tersedia dipinjam' : 'Request ditutup'}
                        </span>
                      )}

                      {/* Superadmin CRUD Controls */}
                      {role === 'superadmin' && (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => openEditModal(item)}
                            title="Edit Alat"
                            className="p-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmItem(item)}
                            title="Hapus Alat"
                            className="p-2 rounded-xl bg-white hover:bg-rose-50 text-rose-600 border border-slate-200 hover:border-rose-200 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: REQUEST PEMINJAMAN (USER VIEW & REQUEST FORM)      */}
        {/* ========================================================= */}
        {activeTab === 'requests' && (
          <div className="space-y-6">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Daftar Permintaan Peminjaman Alat</h2>
                <p className="text-xs sm:text-sm text-slate-500">
                  Pantau status persetujuan peminjaman alat produksi untuk ibadah, youth, atau latihan musik.
                </p>
              </div>
              {pageConfig.allowNewRequests && (
                <button
                  onClick={() => openRequestModal()}
                  className={`px-4 py-2.5 rounded-xl text-sm font-semibold text-white ${theme.bgPrimary} ${theme.bgHover} shadow-sm transition flex items-center gap-2 shrink-0`}
                >
                  <Plus className="w-4 h-4" />
                  Buat Request Baru
                </button>
              )}
            </div>

            {requests.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                <ClipboardList className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-800">Belum Ada Riwayat Request</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  Klik tombol "Buat Request Baru" atau pilih peralatan langsung dari Katalog Inventaris untuk mengajukan peminjaman.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {requests.map((req) => (
                  <div
                    key={req.id}
                    className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        {getRequestStatusBadge(req.status)}
                        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700">
                          {req.ministryTeam}
                        </span>
                        <span className="text-xs text-slate-400">
                          • Diajukan oleh <strong className="text-slate-700">{req.borrowerName}</strong>
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-slate-900">
                        {req.itemName}{' '}
                        <span className="text-sm font-normal text-slate-500">({req.quantity} Unit)</span>
                      </h3>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          Pakai: <strong>{req.borrowDate}</strong> s/d <strong>{req.returnDate}</strong>
                        </span>
                        {req.purpose && <span>• Catatan: "{req.purpose}"</span>}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end md:self-center">
                      {role === 'superadmin' && (
                        <button
                          onClick={() => setActiveTab('manage-requests')}
                          className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                        >
                          Kelola di Panel Admin
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: KELOLA REQUEST (SUPERADMIN APPROVAL PANEL)         */}
        {/* ========================================================= */}
        {activeTab === 'manage-requests' && role === 'superadmin' && (
          <div className="space-y-6">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900">Panel Persetujuan Peminjaman (Superadmin)</h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Menyetujui request akan otomatis mengubah status ketersediaan alat di Katalog menjadi "Dipinjam". Menandai "Dikembalikan" akan mengembalikan status alat menjadi "Tersedia".
              </p>
            </div>

            {requests.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-800">Tidak Ada Request Peminjaman</h3>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        <th className="py-3.5 px-4">Peminjam & Pelayanan</th>
                        <th className="py-3.5 px-4">Nama Peralatan</th>
                        <th className="py-3.5 px-4">Tanggal Pinjam</th>
                        <th className="py-3.5 px-4">Status Saat Ini</th>
                        <th className="py-3.5 px-4 text-right">Tindakan Admin</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-sm">
                      {requests.map((req) => (
                        <tr key={req.id} className="hover:bg-slate-50/80 transition">
                          <td className="py-4 px-4">
                            <div className="font-bold text-slate-900">{req.borrowerName}</div>
                            <div className="text-xs text-slate-500">{req.ministryTeam}</div>
                            {req.purpose && (
                              <div className="text-xs text-slate-400 italic mt-0.5">"{req.purpose}"</div>
                            )}
                          </td>
                          <td className="py-4 px-4">
                            <div className="font-semibold text-slate-800">{req.itemName}</div>
                            <div className="text-xs text-slate-500">Jumlah: {req.quantity} Unit</div>
                          </td>
                          <td className="py-4 px-4 text-xs text-slate-600">
                            <div>Mulai: <strong>{req.borrowDate}</strong></div>
                            <div>Kembali: <strong>{req.returnDate}</strong></div>
                          </td>
                          <td className="py-4 px-4">{getRequestStatusBadge(req.status)}</td>
                          <td className="py-4 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {req.status === 'Menunggu Persetujuan' && (
                                <>
                                  <button
                                    onClick={() => handleUpdateRequestStatus(req, 'Disetujui')}
                                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition flex items-center gap-1 shadow-sm"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                    Setujui
                                  </button>
                                  <button
                                    onClick={() => handleUpdateRequestStatus(req, 'Ditolak')}
                                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition flex items-center gap-1"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                    Tolak
                                  </button>
                                </>
                              )}

                              {req.status === 'Disetujui' && (
                                <button
                                  onClick={() => handleUpdateRequestStatus(req, 'Selesai / Dikembalikan')}
                                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition flex items-center gap-1 shadow-sm"
                                >
                                  <CornerDownLeft className="w-3.5 h-3.5" />
                                  Tandai Dikembalikan
                                </button>
                              )}

                              <button
                                onClick={() => handleDeleteRequest(req.id)}
                                title="Hapus Riwayat"
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: KUSTOMISASI HALAMAN (SUPERADMIN CMS BUILDER)       */}
        {/* ========================================================= */}
        {activeTab === 'customizer' && role === 'superadmin' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Branding & Theme */}
            <div className="lg:col-span-2 space-y-6">
              {/* Branding & Portal Identity */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
                  <Sparkles className={`w-5 h-5 ${theme.textPrimary}`} />
                  <h2 className="text-base font-bold text-slate-900">
                    Identitas & Judul Portal (Real-time Sync)
                  </h2>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                      Nama Portal Website
                    </label>
                    <input
                      type="text"
                      value={pageConfig.portalTitle}
                      onChange={(e) => setPageConfig({ ...pageConfig, portalTitle: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                      Subjudul / Deskripsi Singkat Gereja
                    </label>
                    <input
                      type="text"
                      value={pageConfig.portalSubtitle}
                      onChange={(e) => setPageConfig({ ...pageConfig, portalSubtitle: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                {/* Color Theme Picker */}
                <div className="pt-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-2.5">
                    Pilih Tema Warna Utama Halaman
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                    {Object.entries(THEME_CONFIG).map(([key, t]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => handleUpdateConfig({ themeColor: key })}
                        className={`p-3 rounded-xl border text-left transition flex flex-col gap-2 ${
                          pageConfig.themeColor === key
                            ? 'border-slate-900 ring-2 ring-slate-900/10 bg-slate-50'
                            : 'border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <div className={`w-full h-5 rounded-lg bg-gradient-to-r ${t.gradient}`} />
                        <span className="text-xs font-semibold text-slate-800">{t.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-3 flex justify-end">
                  <button
                    onClick={() =>
                      handleUpdateConfig({
                        portalTitle: pageConfig.portalTitle,
                        portalSubtitle: pageConfig.portalSubtitle
                      })
                    }
                    className={`px-5 py-2.5 rounded-xl text-xs font-bold text-white ${theme.bgPrimary} ${theme.bgHover} shadow-sm transition`}
                  >
                    Simpan Identitas Portal
                  </button>
                </div>
              </div>

              {/* Announcement / SOP Banner Config */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <Megaphone className={`w-5 h-5 ${theme.textPrimary}`} />
                    <h2 className="text-base font-bold text-slate-900">
                      Kustomisasi Banner Pengumuman & SOP Peminjaman
                    </h2>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                      Judul Pengumuman / SOP
                    </label>
                    <input
                      type="text"
                      value={pageConfig.announcementTitle}
                      onChange={(e) => setPageConfig({ ...pageConfig, announcementTitle: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                      Isi Pesan / Peraturan Produksi
                    </label>
                    <textarea
                      rows={3}
                      value={pageConfig.announcementText}
                      onChange={(e) => setPageConfig({ ...pageConfig, announcementText: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      onClick={() =>
                        handleUpdateConfig({
                          announcementTitle: pageConfig.announcementTitle,
                          announcementText: pageConfig.announcementText
                        })
                      }
                      className={`px-5 py-2.5 rounded-xl text-xs font-bold text-white ${theme.bgPrimary} ${theme.bgHover} shadow-sm transition`}
                    >
                      Perbarui Teks Pengumuman
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Visibility Toggles & Custom Categories */}
            <div className="space-y-6">
              {/* Module Visibility Switches */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
                  <Settings className={`w-5 h-5 ${theme.textPrimary}`} />
                  <h2 className="text-base font-bold text-slate-900">Kontrol Modul Halaman</h2>
                </div>

                <div className="space-y-3">
                  <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/70 cursor-pointer">
                    <div>
                      <span className="text-sm font-semibold text-slate-800 block">Tampilkan Kartu Statistik</span>
                      <span className="text-xs text-slate-500">Ringkasan jumlah alat di bagian atas</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={pageConfig.showStats}
                      onChange={(e) => handleUpdateConfig({ showStats: e.target.checked })}
                      className="w-5 h-5 accent-indigo-600 rounded cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/70 cursor-pointer">
                    <div>
                      <span className="text-sm font-semibold text-slate-800 block">Tampilkan Banner SOP</span>
                      <span className="text-xs text-slate-500">Kotak pengumuman di halaman utama</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={pageConfig.showAnnouncement}
                      onChange={(e) => handleUpdateConfig({ showAnnouncement: e.target.checked })}
                      className="w-5 h-5 accent-indigo-600 rounded cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/70 cursor-pointer">
                    <div>
                      <span className="text-sm font-semibold text-slate-800 block">Buka Akses Request Alat</span>
                      <span className="text-xs text-slate-500">Izinkan kru mengajukan peminjaman baru</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={pageConfig.allowNewRequests}
                      onChange={(e) => handleUpdateConfig({ allowNewRequests: e.target.checked })}
                      className="w-5 h-5 accent-indigo-600 rounded cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/70 cursor-pointer">
                    <div>
                      <span className="text-sm font-semibold text-slate-800 block">Tampilkan Lokasi Rak ke User</span>
                      <span className="text-xs text-slate-500">Sembunyikan jika lokasi bersifat rahasia</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={pageConfig.showStorageToUsers}
                      onChange={(e) => handleUpdateConfig({ showStorageToUsers: e.target.checked })}
                      className="w-5 h-5 accent-indigo-600 rounded cursor-pointer"
                    />
                  </label>
                </div>
              </div>

              {/* Manage Custom Categories */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
                  <Layers className={`w-5 h-5 ${theme.textPrimary}`} />
                  <h2 className="text-base font-bold text-slate-900">Kategori Inventaris</h2>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newCategoryInput}
                    onChange={(e) => setNewCategoryInput(e.target.value)}
                    placeholder="Tambah kategori baru..."
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none"
                  />
                  <button
                    onClick={handleAddCategory}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold text-white ${theme.bgPrimary}`}
                  >
                    Tambah
                  </button>
                </div>

                <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                  {pageConfig.categories.map((cat) => (
                    <div
                      key={cat}
                      className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-50 border border-slate-200/60 text-xs font-medium text-slate-700"
                    >
                      <span className="flex items-center gap-2">
                        {getCategoryIcon(cat)}
                        {cat}
                      </span>
                      <button
                        onClick={() => handleRemoveCategory(cat)}
                        className="text-slate-400 hover:text-rose-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ========================================================= */}
      {/* MODAL 1: ADD / EDIT INVENTORY ITEM (SUPERADMIN)           */}
      {/* ========================================================= */}
      {itemModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <h3 className="text-lg font-bold text-slate-900">
                {editingItem ? 'Edit Peralatan Produksi' : 'Tambah Peralatan Baru'}
              </h3>
              <button
                onClick={() => setItemModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Nama Alat / Tipe *
                </label>
                <input
                  type="text"
                  required
                  value={itemForm.name}
                  onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                  placeholder="Contoh: Shure SM58 Dynamic Microphone"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Kode / Serial Number
                  </label>
                  <input
                    type="text"
                    value={itemForm.serialNumber}
                    onChange={(e) => setItemForm({ ...itemForm, serialNumber: e.target.value })}
                    placeholder="IFGF-AUD-010"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Kategori
                  </label>
                  <select
                    value={itemForm.category}
                    onChange={(e) => setItemForm({ ...itemForm, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white"
                  >
                    {pageConfig.categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Jumlah Unit
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={itemForm.quantity}
                    onChange={(e) => setItemForm({ ...itemForm, quantity: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Kondisi
                  </label>
                  <select
                    value={itemForm.condition}
                    onChange={(e) => setItemForm({ ...itemForm, condition: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white"
                  >
                    <option value="Baik">Baik</option>
                    <option value="Perlu Perbaikan">Perlu Perbaikan</option>
                    <option value="Rusak">Rusak</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Status
                  </label>
                  <select
                    value={itemForm.status}
                    onChange={(e) => setItemForm({ ...itemForm, status: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white"
                  >
                    <option value="Tersedia">Tersedia</option>
                    <option value="Dipinjam">Dipinjam</option>
                    <option value="Maintenance">Maintenance</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Lokasi Penyimpanan / Posisi Rak
                </label>
                <input
                  type="text"
                  value={itemForm.location}
                  onChange={(e) => setItemForm({ ...itemForm, location: e.target.value })}
                  placeholder="Contoh: Lemari Audio Utama - Rak B2"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Catatan / Kelengkapan Alat
                </label>
                <textarea
                  rows={2}
                  value={itemForm.notes}
                  onChange={(e) => setItemForm({ ...itemForm, notes: e.target.value })}
                  placeholder="Kelengkapan pouch, baterai, adaptor, dll."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setItemModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold text-white ${theme.bgPrimary} ${theme.bgHover} shadow-sm`}
                >
                  {editingItem ? 'Simpan Perubahan' : 'Tambahkan Alat'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: FORM REQUEST PEMINJAMAN ALAT (USER / CREW)       */}
      {/* ========================================================= */}
      {requestModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Form Request Peminjaman Alat</h3>
                <p className="text-xs text-slate-500">Isi detail penggunaan peralatan untuk pelayanan IFGF</p>
              </div>
              <button
                onClick={() => setRequestModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitRequest} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Pilih Peralatan *
                </label>
                <select
                  value={requestForm.itemId}
                  onChange={(e) => {
                    const found = inventory.find((i) => i.id === e.target.value);
                    setRequestForm({
                      ...requestForm,
                      itemId: e.target.value,
                      itemName: found ? found.name : ''
                    });
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white"
                  required
                >
                  {inventory.map((item) => (
                    <option key={item.id} value={item.id} disabled={item.status !== 'Tersedia'}>
                      {item.name} ({item.status} - {item.quantity} unit)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Nama Peminjam / PIC Kru *
                  </label>
                  <input
                    type="text"
                    required
                    value={requestForm.borrowerName}
                    onChange={(e) => setRequestForm({ ...requestForm, borrowerName: e.target.value })}
                    placeholder="Nama lengkap Anda"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Kegiatan / Tim Pelayanan
                  </label>
                  <select
                    value={requestForm.ministryTeam}
                    onChange={(e) => setRequestForm({ ...requestForm, ministryTeam: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white"
                  >
                    {(pageConfig.eventsList || DEFAULT_SETTINGS.eventsList).map((ev) => (
                      <option key={ev} value={ev}>
                        {ev}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Jumlah Pinjam
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={requestForm.quantity}
                    onChange={(e) => setRequestForm({ ...requestForm, quantity: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Tanggal Pakai
                  </label>
                  <input
                    type="date"
                    required
                    value={requestForm.borrowDate}
                    onChange={(e) => setRequestForm({ ...requestForm, borrowDate: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Tanggal Kembali
                  </label>
                  <input
                    type="date"
                    required
                    value={requestForm.returnDate}
                    onChange={(e) => setRequestForm({ ...requestForm, returnDate: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Keperluan / Keterangan Tambahan
                </label>
                <textarea
                  rows={2}
                  value={requestForm.purpose}
                  onChange={(e) => setRequestForm({ ...requestForm, purpose: e.target.value })}
                  placeholder="Contoh: Dipakai untuk rekaman akustik Youth di Studio lantai 2"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setRequestModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold text-white ${theme.bgPrimary} ${theme.bgHover} shadow-sm`}
                >
                  Kirim Request Peminjaman
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 3: DELETE CONFIRMATION                              */}
      {/* ========================================================= */}
      {deleteConfirmItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-slate-200 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Hapus Peralatan Ini?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Anda yakin ingin menghapus <strong>"{deleteConfirmItem.name}"</strong> secara permanen dari database inventaris IFGF?
              </p>
            </div>
            <div className="flex items-center justify-center gap-2.5 pt-2">
              <button
                onClick={() => setDeleteConfirmItem(null)}
                className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 transition"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="bg-white border-t border-slate-200/80 py-4 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700">{pageConfig.portalTitle}</span>
            <span>•</span>
            <span>Real-time Cloud Database Aktif</span>
          </div>
          <div>
            ID Sesi Kru: <code className="font-mono text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">{user?.uid || 'Menghubungkan...'}</code>
          </div>
        </div>
      </footer>
    </div>
  );
}
