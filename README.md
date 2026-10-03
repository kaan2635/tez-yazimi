# TezPusulası

Tıpta uzmanlık tezleri için HTML tabanlı, Türkçe bir çalışma alanı. Proje bilgilerini, kaynak bağlantılarını ve ilerleme planını tek yerde toplar; eksik bilgileri görünür kılar ve doğrulanmamış bulgu üretmez.

## Faz 1 — Proje kurulumu

Bu sürüm, **proje profili ve yazım gereksinimleri için çalışan bir ön yüz prototipidir**. Başlangıç profili, kullanıcının verdiği tez bilgileriyle önceden doldurulmuştur:

- **Başlık:** Kolelitiazisli çocuklarda etiyoloji, klinik ve tedavi süreçlerinin değerlendirilmesi
- **Merkez:** Sağlık Bilimleri Üniversitesi Bursa Yüksek İhtisas Eğitim ve Araştırma Hastanesi
- **Klinik:** Çocuk Gastroenteroloji Kliniği
- **Dönem:** 2016–2025
- **Yaş:** 0–18
- **Dil / hedef uzunluk:** Türkçe / 50–100 sayfa
- **Yönerge:** Kullanıcının sağladığı SBÜ Tıp Fakültesi Tez Yazım Kılavuzu

Faz 1 özellikleri:

- Temel bilgiler, araştırma planı ve yönerge/kaynak alanları
- Zorunlu proje alanları için tamamlanma kontrolü
- Canlı, kopyalanabilir proje özeti
- Tarayıcı `localStorage` alanına otomatik ve manuel kayıt
- Proje profilini JSON olarak dışa aktarma ve içe aktarma
- Sonraki fazları tanımlayan ürün yol haritası

## Çalıştırma

Bağımlılık veya derleme adımı yoktur. Başlangıç profilinin JSON dosyasını yükleyebilmek için uygulamayı yerel bir web sunucusu üzerinden açın:

```bash
python3 -m http.server 4173 --bind 0.0.0.0
```

Ardından `http://localhost:4173` adresini açın. Bu prototipte bir uygulama sunucusu, harici yapay zekâ API'si veya kaynak arama servisi yoktur.

## Veri ve gizlilik sınırı

Faz 1'de proje bilgileri tarayıcıda, `tezpusulasi.project.v1` anahtarı altında saklanır. Uygulama bunları GitHub'a veya başka bir sunucuya göndermez. JSON dışa aktarım dosyası yalnızca tez proje metaverisini ve kaynak URL'lerini içerir.

**Hasta verisi, ad-soyad, T.C. kimlik numarası, protokol numarası, doğum tarihi, iletişim bilgisi veya kişiyi tanınabilir kılabilecek klinik anlatı eklemeyin.** Klinik veri girişi/analizi Faz 4 için ayrı gizlilik ve veri işleme tasarımı gerektirir. Etik kurul bilgisi kullanıcı tarafından resmî karar belgesine göre eklenecektir; uygulama bu bilgiyi üretmez.

## Dosyalar

- `index.html` — arayüz ve form
- `styles.css` — duyarlı görsel tasarım
- `app.js` — yerel kayıt, doğrulama, içe/dışa aktarım ve proje özeti
- `data/starter-project.json` — kullanıcı girdileriyle oluşturulan başlangıç profili
- `ROADMAP.md` — faz kapsamları ve kabul ölçütleri

## Yol haritası

1. **Proje kurulumu:** profil, yönerge ve kaynak başlangıç listesi, yerel kayıt, JSON yedekleme. (Mevcut)
2. **Kaynak yönetimi:** DOI/PMID doğrulama, kaynak künyesi, kanıt matrisi ve numaralı atıf takibi.
3. **Yöntem ve veri sözlüğü:** protokol, dahil/dışlama ölçütleri, değişken tanımları, etik alanı ve analiz planı.
4. **Veri ve bulgular:** yalnızca onaylı ve kimliksizleştirilmiş veriyle analiz, tablo/şekil üretimi ve eksik veri raporu.
5. **Tez üretimi:** kaynak destekli bölüm taslakları, tutarlılık denetimleri ve SBÜ biçimine göre DOCX/PDF çıktısı.

Ayrıntılı kapsam ve kabul ölçütleri için [`ROADMAP.md`](ROADMAP.md) dosyasına bakın.
