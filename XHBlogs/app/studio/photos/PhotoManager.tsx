"use client";

import { ChangeEvent, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, ImagePlus, Images, Plus, Save, Trash2, Upload } from "lucide-react";

type Photo = { url: string; caption?: string };
type Album = { id: string; title: string; description: string; cover: string; date: string; photos: Photo[] };

function blankAlbum(): Album {
  const now = new Date();
  return {
    id: `album-${now.toLocaleDateString("en-CA", { timeZone: "Asia/Shanghai" })}`,
    title: "新相册",
    description: "",
    cover: "",
    date: `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, "0")}`,
    photos: [],
  };
}

function copyAlbum(album: Album) {
  return { ...album, photos: album.photos.map((photo) => ({ ...photo })) };
}

async function compressImage(file: File) {
  const source = URL.createObjectURL(file);
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const element = new Image();
    element.onload = () => resolve(element);
    element.onerror = () => reject(new Error("无法读取这张图片。"));
    element.src = source;
  });
  try {
    let maxDimension = 1800;
    let quality = 0.88;
    for (let attempt = 0; attempt < 6; attempt += 1) {
      const ratio = Math.min(1, maxDimension / Math.max(image.width, image.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(image.width * ratio));
      canvas.height = Math.max(1, Math.round(image.height * ratio));
      const context = canvas.getContext("2d");
      if (!context) throw new Error("浏览器无法压缩图片。" );
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
      if (blob && blob.size <= 850 * 1024) {
        return new File([blob], `${file.name.replace(/\.[^.]+$/, "") || "photo"}.jpg`, { type: "image/jpeg" });
      }
      maxDimension = Math.round(maxDimension * 0.78);
      quality -= 0.1;
    }
    throw new Error("图片压缩后仍然过大，请换一张较小的图片。" );
  } finally {
    URL.revokeObjectURL(source);
  }
}

export default function PhotoManager() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Album>(() => blankAlbum());
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadAlbums = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/albums", { cache: "no-store" });
      if (response.status === 401) {
        setAuthenticated(false);
        return;
      }
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "无法读取相册。");
      setAuthenticated(true);
      setAlbums(data.albums || []);
      if (data.albums?.length && !selectedId) {
        setSelectedId(data.albums[0].id);
        setDraft(copyAlbum(data.albums[0]));
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "无法读取相册。");
    } finally {
      setLoading(false);
    }
  }, [selectedId]);

  useEffect(() => { void loadAlbums(); }, [loadAlbums]);

  const selectAlbum = (album: Album) => {
    setSelectedId(album.id);
    setDraft(copyAlbum(album));
    setMessage("");
  };

  const startNew = () => {
    setSelectedId(null);
    setDraft(blankAlbum());
    setMessage("");
  };

  const updateDraft = (key: keyof Album, value: string | Photo[]) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  const updatePhoto = (index: number, key: keyof Photo, value: string) => {
    setDraft((current) => ({ ...current, photos: current.photos.map((photo, photoIndex) => photoIndex === index ? { ...photo, [key]: value } : photo) }));
  };

  const addPhotoLink = () => setDraft((current) => ({ ...current, photos: [...current.photos, { url: "", caption: "" }] }));
  const removePhoto = (index: number) => setDraft((current) => ({ ...current, photos: current.photos.filter((_, photoIndex) => photoIndex !== index) }));
  const setCover = (url: string) => setDraft((current) => ({ ...current, cover: url }));

  const uploadPhotos = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    event.target.value = "";
    if (!files.length) return;
    if (!/^[a-z0-9][a-z0-9-]{0,60}$/.test(draft.id)) {
      setMessage("请先填写有效的相册标识，再上传图片。" );
      return;
    }
    setSaving(true);
    setMessage(`正在压缩并上传 ${files.length} 张图片...`);
    try {
      const uploaded: Photo[] = [];
      for (const source of files) {
        if (!["image/jpeg", "image/png", "image/webp"].includes(source.type)) throw new Error("只支持 JPG、PNG 和 WebP 图片。" );
        const image = await compressImage(source);
        const formData = new FormData();
        formData.set("albumId", draft.id);
        formData.set("file", image);
        const response = await fetch("/api/admin/media", { method: "POST", body: formData });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "图片上传失败。" );
        uploaded.push({ url: data.url, caption: source.name.replace(/\.[^.]+$/, "") });
      }
      setDraft((current) => ({ ...current, photos: [...current.photos, ...uploaded], cover: current.cover || uploaded[0]?.url || current.cover }));
      setMessage("图片已上传到仓库。点击“保存相册”后，它们才会出现在照片墙。" );
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "图片上传失败。" );
    } finally {
      setSaving(false);
    }
  };

  const save = async () => {
    setSaving(true);
    setMessage("");
    try {
      const existsAt = albums.findIndex((album) => album.id === selectedId);
      const nextAlbums = existsAt === -1 ? [...albums, draft] : albums.map((album, index) => index === existsAt ? draft : album);
      const response = await fetch("/api/admin/albums", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ albums: nextAlbums }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "保存相册失败。" );
      setAlbums(nextAlbums);
      setSelectedId(draft.id);
      setMessage("相册已提交到 GitHub，Vercel 部署完成后会自动出现在照片墙。" );
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "保存相册失败。" );
    } finally {
      setSaving(false);
    }
  };

  const removeAlbum = async () => {
    if (!selectedId || !window.confirm("确定删除这个相册记录吗？已上传的原图会保留在仓库中，避免误删。")) return;
    setSaving(true);
    try {
      const nextAlbums = albums.filter((album) => album.id !== selectedId);
      const response = await fetch("/api/admin/albums", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ albums: nextAlbums }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "删除相册失败。" );
      setAlbums(nextAlbums);
      startNew();
      setMessage("相册记录已删除，并已提交到 GitHub。" );
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "删除相册失败。" );
    } finally {
      setSaving(false);
    }
  };

  if (authenticated === false) {
    return <main className="mx-auto flex min-h-[70vh] w-[90%] max-w-xl items-center justify-center pt-24"><section className="photo-panel w-full p-8 text-center"><Images className="mx-auto text-cyan-200" size={34} /><h1 className="mt-5 text-2xl font-black text-white">相册节点未认证</h1><Link href="/studio" className="mt-6 inline-flex border border-cyan-200/40 px-4 py-2 text-sm font-bold text-cyan-100">返回系统认证</Link></section></main>;
  }

  return (
    <main className="mx-auto w-[94%] max-w-7xl pt-24 md:pt-28">
      <div className="mb-6 flex flex-col justify-between gap-4 border-b border-cyan-800/30 pb-5 dark:border-cyan-200/15 md:flex-row md:items-end">
        <div><p className="text-xs font-bold tracking-[0.28em] text-cyan-700 dark:text-cyan-200">SYSTEM AUTHENTICATION // PHOTO ARCHIVE</p><h1 className="mt-1 text-3xl font-black tracking-wider text-slate-900 dark:text-white">相册管理</h1></div>
        <Link href="/studio" className="inline-flex items-center gap-2 text-sm font-bold text-cyan-700 dark:text-cyan-200"><ArrowLeft size={16} />返回内容节点</Link>
      </div>

      <div className="grid gap-5 lg:grid-cols-[250px_minmax(0,1fr)]">
        <aside className="photo-panel p-3">
          <button onClick={startNew} className="flex w-full items-center justify-center gap-2 border border-cyan-200/45 bg-cyan-300/10 px-3 py-2.5 text-sm font-bold text-cyan-100 hover:bg-cyan-300/20"><Plus size={16} />新建相册</button>
          <div className="mt-4 max-h-[60vh] space-y-1 overflow-y-auto">
            {albums.map((album) => <button key={album.id} onClick={() => selectAlbum(album)} className={`block w-full border-l-2 px-3 py-3 text-left transition-colors ${selectedId === album.id ? "border-cyan-200 bg-cyan-300/10" : "border-transparent hover:bg-white/5"}`}><span className="block truncate text-sm font-bold text-slate-100">{album.title}</span><span className="mt-1 block text-[10px] tracking-wider text-slate-400">{album.photos.length} 张照片 · {album.date}</span></button>)}
            {!loading && albums.length === 0 && <p className="px-3 py-5 text-xs text-slate-400">尚未建立相册</p>}
          </div>
        </aside>

        <section className="photo-panel p-4 md:p-7">
          <div className="mb-5 flex items-center justify-between border-b border-cyan-200/15 pb-4"><div className="flex items-center gap-2 text-lg font-black text-white"><ImagePlus size={19} className="text-cyan-200" />{selectedId ? "编辑相册" : "新建相册"}</div><span className="text-xs text-cyan-100/50">PHOTO ARCHIVE</span></div>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="相册名称"><input value={draft.title} onChange={(event) => updateDraft("title", event.target.value)} className="photo-input" /></Field>
            <Field label="归档日期"><input value={draft.date} onChange={(event) => updateDraft("date", event.target.value)} placeholder="2026.08" className="photo-input" /></Field>
            <Field label="相册标识"><input value={draft.id} onChange={(event) => updateDraft("id", event.target.value.toLowerCase())} className="photo-input font-mono" /></Field>
            <Field label="封面图片链接"><input value={draft.cover} onChange={(event) => updateDraft("cover", event.target.value)} placeholder="可在下方照片中设为封面" className="photo-input" /></Field>
            <div className="md:col-span-2"><Field label="相册描述"><input value={draft.description} onChange={(event) => updateDraft("description", event.target.value)} className="photo-input" /></Field></div>
          </div>

          <div className="mt-7 border-t border-cyan-200/15 pt-5"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-base font-black text-white">相册照片</h2><p className="mt-1 text-xs text-slate-400">先确认相册标识，再上传本地图片。每张图片会自动压缩。</p></div><div className="flex gap-2"><button onClick={addPhotoLink} className="inline-flex items-center gap-2 border border-cyan-200/30 px-3 py-2 text-xs font-bold text-cyan-100 hover:bg-cyan-300/10"><Plus size={14} />添加链接</button><button onClick={() => fileInputRef.current?.click()} disabled={saving} className="inline-flex items-center gap-2 border border-amber-200/45 bg-amber-200/10 px-3 py-2 text-xs font-bold text-amber-100 hover:bg-amber-200/20 disabled:opacity-50"><Upload size={14} />上传图片</button><input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={uploadPhotos} className="hidden" /></div></div>
            <div className="mt-4 space-y-3">
              {draft.photos.map((photo, index) => <div key={`${photo.url}-${index}`} className="grid gap-2 border border-cyan-200/15 bg-black/10 p-3 md:grid-cols-[84px_minmax(0,1fr)_minmax(0,1fr)_auto] md:items-center"><div className="h-16 overflow-hidden border border-cyan-200/15 bg-slate-900">{photo.url ? <img src={photo.url} alt="" className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-slate-600"><Images size={18} /></div>}</div><input value={photo.url} onChange={(event) => updatePhoto(index, "url", event.target.value)} placeholder="图片链接" className="photo-input" /><input value={photo.caption || ""} onChange={(event) => updatePhoto(index, "caption", event.target.value)} placeholder="图片说明" className="photo-input" /><div className="flex gap-1"><button onClick={() => setCover(photo.url)} title="设为封面" className="icon-button text-cyan-100"><Check size={15} /></button><button onClick={() => removePhoto(index)} title="删除照片" className="icon-button text-rose-200"><Trash2 size={15} /></button></div></div>)}
              {draft.photos.length === 0 && <div className="border border-dashed border-cyan-200/20 px-4 py-10 text-center text-sm text-slate-400">上传图片或添加图片链接后，再保存相册。</div>}
            </div>
          </div>

          {message && <p className="mt-5 border-l-2 border-cyan-200 bg-cyan-300/10 px-3 py-2 text-sm text-cyan-50">{message}</p>}
          <div className="mt-6 flex justify-between gap-3">{selectedId ? <button onClick={() => void removeAlbum()} disabled={saving} className="inline-flex items-center gap-2 border border-rose-300/35 px-4 py-2.5 text-sm font-bold text-rose-100 hover:bg-rose-400/10 disabled:opacity-50"><Trash2 size={16} />删除相册</button> : <span />}<button onClick={() => void save()} disabled={saving} className="inline-flex items-center gap-2 border border-cyan-200/50 bg-cyan-300/15 px-5 py-2.5 text-sm font-bold text-cyan-50 hover:bg-cyan-300/25 disabled:opacity-50"><Save size={16} />{saving ? "处理中..." : "保存相册"}</button></div>
        </section>
      </div>
      <style jsx>{`.photo-panel { clip-path: polygon(0 12px, 12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%); border: 1px solid rgba(125,211,252,.2); background: rgba(9,27,39,.9); box-shadow: 0 18px 55px rgba(0,12,24,.28); } .photo-input { width: 100%; border: 1px solid rgba(125,211,252,.28); background: rgba(4,17,26,.72); padding: .65rem .75rem; color: #e2e8f0; outline: none; } .photo-input:focus { border-color: #67e8f9; box-shadow: 0 0 0 2px rgba(103,232,249,.14); } .icon-button { display: inline-flex; width: 2rem; height: 2rem; align-items: center; justify-content: center; border: 1px solid rgba(125,211,252,.22); background: rgba(4,17,26,.7); } .icon-button:hover { background: rgba(103,232,249,.12); }`}</style>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block text-sm font-bold text-slate-200"><span className="mb-1.5 block">{label}</span>{children}</label>;
}
