# TezPusulası — Ürün yol haritası

## Ürün ilkeleri

1. **Uydurma yok:** Kullanıcı verisinde olmayan hasta özelliği, bulgu, istatistik, etik karar veya kaynak bilgisi oluşturulmaz.
2. **Kaynak izi:** Akademik iddialar, kaynak kaydına ve metin içi atıfa geri izlenebilir olmalıdır.
3. **Belirsizlik görünür:** Eksik, onay bekleyen veya yalnızca öneri niteliğindeki alanlar kesin bilgi gibi gösterilmez.
4. **Mahremiyet varsayılanı:** Kimlik belirleyici hasta verisi uygulamaya alınmaz. Analiz fazından önce saklama, erişim ve anonimleştirme koşulları açıkça tanımlanır.
5. **Kılavuz önceliği:** Üniversite/bölüm kılavuzu biçim kararlarının tek kaynağıdır; genel şablon onunla çelişirse kılavuz uygulanır.
6. **İnsan denetimi:** Otomasyon tez danışmanı, etik kurul, istatistik uzmanı veya klinik değerlendirme yerine geçmez.

## Faz 1 — Proje kurulumu ve gereksinim kaydı

**Durum:** Uygulandı — statik HTML prototipi.

### Kapsam
- Tez başlığı, derece, alan, kurum, klinik, tarih aralığı ve yaş aralığı.
- Araştırma konusu, amaç, araştırma sorusu, önerilen tasarım ve izlem durumu.
- Taslak dahil/dışlama ölçütleri; kesin protokolle uyum uyarısı.
- Tez yazım kılavuzu bağlantısı, atıf stili ve başlangıç kaynak bağlantıları.
- Etik kurul ve bulgu alanlarında "kullanıcı tarafından eklenecek / veri bekleniyor" durumu.
- Temel alan tamamlama göstergesi ve canlı proje özeti.
- Tarayıcıda yerel kayıt, JSON yedekleme ve profil içe aktarma.

### Kabul ölçütleri
- [x] SBÜ Bursa Yüksek İhtisas EAH / Çocuk Gastroenteroloji / 2016–2025 / 0–18 yaş profili yüklenir.
- [x] Başlık ve proje alanları düzenlenebilir.
- [x] Temel alan eksikleri kullanıcıya gösterilir.
- [x] Sayfa yenilendiğinde yerel kayıt korunur.
- [x] JSON dışa/içe aktarım çalışır.
- [x] Hasta verisi yükleme veya sunucuya veri gönderme özelliği yoktur.
- [x] Bulgu/etik bilgileri üretilmez; kullanıcı girdisi beklediği belirtilir.
- [x] Dar ekranlarda form ve yol haritası kullanılabilir.

### Bu fazda olmayanlar
- Kaynak URL'lerinin otomatik açılması veya DOI/PMID doğrulaması.
- Akademik literatür taraması ya da LLM ile tez bölümü oluşturma.
- Ham hasta verisi yükleme, istatistiksel analiz veya klinik öneri.
- DOCX/PDF tez çıktısı.

## Faz 2 — Kaynak yönetimi ve kanıt matrisi

**Amaç:** Kaynak bağlantılarını, tam bibliyografik kayıtları ve tez içindeki iddiaları birbirine bağlamak.

### Planlanan işlevler
- DOI, PMID ve URL alanları ile kaynak kayıtları.
- Dergi, yıl, yazarlar, çalışma türü, örneklem, temel sonuç ve kısıtlılık alanları.
- DOI/PMID çözümleme ve mümkün olmayan doğrulama durumlarının açıkça işaretlenmesi.
- Vancouver/SBÜ kılavuzuna göre ilk geçiş sırasına bağlı numaralı atıf listesi.
- Her yazım iddiası için en az bir kaynak bağlantısı ve kaynak içeriği kontrolü.
- Kullanıcı tarafından onaylanmamış kaynakları tez metnine dahil etmeme.

### Kabul ölçütleri
- Kaynakça kaydı ve metin içi atıf numarası tutarlı kalır.
- Doğrulanamayan metadata "doğrulanamadı" olarak görünür; tahmin edilmez.
- Web kaynaklarında erişim tarihi alanı bulunur.

## Faz 3 — Yöntem, etik ve veri sözlüğü

**Amaç:** Araştırma protokolünü veri toplanmadan önce açık ve denetlenebilir hale getirmek.

### Planlanan işlevler
- Çalışma türü, merkez, dönem, evren, olgu seçimi ve dahil/dışlama ölçütleri.
- Değişken sözlüğü: ad, tanım, veri tipi, birim, izin verilen değerler, kaynak alan ve eksik veri kodu.
- "Yok", "bilinmiyor", "kayıtta yok" ve "uygulanamaz" değerlerini birbirinden ayırma.
- Etik kurul tarih/no, kurum izni ve onaylı protokol sürümü için kayıt alanları.
- STROBE raporlama kontrol listesi.
- Analiz planı: tanımlayıcı özetler, karşılaştırmalar, eksik veri yaklaşımı ve koşullu modelleme.

### Kabul ölçütleri
- Yöntem taslağı ile veri sözlüğü çelişmez.
- Etik kurul/protokol bilgileri boşsa bölüm "tamamlandı" işaretlenmez.
- Olay sayısı yetersizse regresyon veya alt grup analizi önerisi kesin sonuç gibi sunulmaz.

## Faz 4 — Güvenli veri analizi ve bulgular

**Ön koşul:** Kurum ve etik süreçlerinin belirlediği veri kullanma/onay şartları ile uyumlu kimliksizleştirme. Ham kimlik bilgileri ürün kapsamı dışında kalır.

### Planlanan işlevler
- Onaylı değişken sözlüğüne göre CSV/XLSX eşleştirme.
- Şema ve değer aralığı doğrulama; kişisel tanımlayıcı alanlara karşı ön kontrol.
- Kayıt sayısı, yinelenen olgular, eksik alanlar ve veri sözlüğü uyuşmazlıklarının raporu.
- Önceden belirlenmiş plana göre tanımlayıcı istatistik ve uygun karşılaştırmalar.
- Bulgulardan otomatik tablo taslakları; payda ve eksik veri sayısının gösterimi.
- Analiz kodu, yazılım/sürüm ve dönüşümlerin tekrarlanabilir kayıt altına alınması.

### Kabul ölçütleri
- Her tablo, analiz edilen olgu sayısını ve eksik veriyi belirtir.
- Analiz çıktısı kaynak veri veya kod ile izlenebilir.
- Nedensel ifade, çalışma tasarımının desteklemediği yerde üretilmez.
- Kullanıcı onayı olmadan bireysel kayıt veya hücre düzeyinde küçük sayılar dışa aktarılmaz.

## Faz 5 — Tez bölümleri, tutarlılık ve çıktı

### Planlanan işlevler
- SBÜ başlık sırası ve biçim kurallarına göre Türkçe/İngilizce bölümler.
- Giriş ve genel bilgilerde kaynak destekli iddialar; bulgular bölümünde yalnız analiz edilmiş veriler.
- Özetin bulgu/sonuçlar kesinleşmeden tamamlanmaması.
- Başlık, amaç, yöntem, tablolar, tartışma ve sonuç arasında tutarlılık denetimi.
- Kaynak-atıf eşleşmesi ve eksik/atıfsız akademik iddia taraması.
- DOCX ve PDF üretimi; sayfa numarası, başlık seviyeleri, içindekiler ve ek kontrolleri.
- Teslim öncesi kullanıcı/danışman onay listesi.

### Kabul ölçütleri
- Kaynakçada bulunmayan metin içi atıf ve metinde kullanılmayan kaynaklar raporlanır.
- Özet ve sonuç bölümleri yalnız kesinleşmiş bulgularla oluşturulur.
- Kılavuzda belirtilen sayfa ve biçim kısıtları çıktı kontrolünden geçer.
- Dışa aktarım öncesi taslak/eksik bilgi/insan incelemesi uyarıları gösterilir.

## Sürümleme yaklaşımı

Her faz ayrı bir küçük teslimat olarak geliştirilecek; önceki fazların veri şeması `schemaVersion` ile sürümlenecek. Proje profilini JSON ile dışa/içe aktarma geriye dönük desteklenecek veya değişiklikler açıkça bildirilecek. Yeni fazlar, gerekli gizlilik ve doğrulama ölçütleri tanımlanmadan hasta verisi kabul etmeyecek.
