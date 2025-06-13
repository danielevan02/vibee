// components/DemoVideo.jsx
"use client"; // Tetap pertahankan ini

import dynamic from 'next/dynamic';
import React from 'react'; // Impor React

// Memuat ReactPlayer secara dinamis, hanya di sisi klien (ssr: false)
const ReactPlayer = dynamic(() => import('react-player'), { ssr: false });

export default function DemoVideo() {
  return (
    <div>
      {/* Tambahkan pengecekan apakah komponen sudah dimuat di klien */}
      {typeof window !== 'undefined' && (
        <ReactPlayer url='/video.mp4' width='100%' height='auto' />
      )}
    </div>
  );
}