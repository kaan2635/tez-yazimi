# Tez Yazım Otomasyonu — Yol Haritası

Bu yol haritasının hedefi bir proje/ilerleme panosu değil; bilimsel girdileri denetleyen, eksikleri açıkça gösteren ve yalnızca dayanağı bulunan tez bölümleri için taslak hazırlayan bir HTML yazım aracıdır.

## Faz 1 — Yazım stüdyosu ve güvenli bölüm üretimi (mevcut)

- [x] Kullanıcının verdiği tez konusu, kurum, klinik, dönem (2016–2025) ve yaş aralığı (0–18) ile başlangıç profili.
- [x] Araştırma amacı, soruları, yöntem taslağı, evren, dahil/dışlama ölçütleri, etik durumu, kaynakça, doğrulanmış kaynak notları ve bulgular için düzenlenebilir form.
- [x] Bölüme göre girdi kapıları: analiz edilmiş bulgu olmadan Özet/Bulgular/Tartışma/Sonuç; kaynakça ve kaynak notları olmadan literatür bölümü üretilmez.
- [x] API anahtarını istemciye koymayan, isteğe bağlı OpenAI-uyumlu sunucu köprüsü; yapılandırma yokken üretim olduğu iddia edilmez.
- [x] Etik, taslak protokol ve veri eksiklikleri için açık yer tutucu ve uyarılar; bulgu, atıf, kaynak veya istatistik uydurmama talimatları.
- [x] Üretilen metni düzenleme, bölüm bölüm kopyalama, tamamını kopyalama, Markdown indirme ve JSON taslak içe/dışa aktarma.
- [x] Otomatik taslak saklama yok; sunucu tez girdilerini diske yazmaz. Kimliksizleştirme uyarısı, yerel dosya okuma ve temel T.C. kimlik numarası taraması.
- [x] Küçük ekranlara uyumlu Türkçe arayüz, klavye erişimi, başlangıç yol haritası ve yerel testler.

**Açık sınırlamalar:** Gerçek model üretimi için kullanıcı tarafından sunucuda sağlayıcı/anahtar yapılandırılmalıdır. Etik kurul bilgisi, protokolün nihai ölçütleri, gerçek bulgular ve kaynak tam metin doğrulaması sağlanmamıştır. Uygulama bu bilgileri üretmez. Model/kurum sözleşmesi, klinik veri gizliliği ve akademik uygunluk ayrıca değerlendirilmelidir.

## Faz 2 — Kaynakların doğrulanabilir yönetimi

- DOI, PMID ve URL temelli kaynak içe aktarma; Crossref/PubMed metaverisini kullanıcı onayıyla kaydetme.
- Kaynak künyesi, erişim tarihi, tam metin ve iddia-notu ilişkisinin ayrı tutulması.
- Atıfları metindeki ilk geçiş sırasına göre otomatik numaralandırma ve yinelenen/eksik künye uyarıları.
- Lisans ve erişim kuralları izin verdiğinde kullanıcı tarafından sağlanan kaynak dosyalarından yerel arama; her iddia için sayfa/bölüm dayanağı.
- Veri tabanından otomatik indirme veya otomatik referans üretme, doğrulanmadıkça kapalı kalmalı.

## Faz 3 — Yöntem ve analiz protokolü

- Onaylı protokol sürümünü, etik kurul kararını, tarih ve numarayı kullanıcı girişiyle ekleme.
- Veri sözlüğü: tanımlar, ölçüm birimleri, eksik veri kodları, birincil/ikincil sonlanımlar ve dahil/dışlama ölçütleri.
- Önceden belirlenmiş istatistiksel analiz planını, yapılan analizlerden ayırma; tablo/şekil taslaklarını yalnızca sağlanan analiz çıktılarından üretme.
- Duyarlılık, örneklem ve alt grup sonuçlarını yeterli veri yoksa hesaplamama; çoklu karşılaştırma ve eksik veri sınırlarını bildirme.

## Faz 4 — Tez biçimlendirme ve dışa aktarım

- SBÜ'nün yürürlükteki tez kılavuzunu kullanıcı onayıyla yapılandırılabilir kurallara dönüştürme.
- Başlık stilleri, sayfa düzeni, yapılandırılmış Türkçe/İngilizce özet ve alfabetik MeSH anahtar kelimeleri için DOCX/PDF dışa aktarımı.
- Her bölüm için kaynak/kanıt izi, eksik alan listesi ve danışman düzeltmelerini koruyan sürüm karşılaştırması.
- Kaynakça numaralandırması ile metin içi atıfların çapraz denetimi.

## Faz 5 — Kurumsal güvenlik ve değerlendirme

- İnternete açılan dağıtımlarda kullanıcı kimlik doğrulaması, rol tabanlı erişim, şifreli depolama, denetim izi ve kurum onayı.
- Harici model kullanımında veri işleme sözleşmesi, saklama ve eğitim politikası, bölgesel barındırma ve silme süreci.
- Hasta verileri için etik kurul/kurumsal güvenlik değerlendirmesi ve gerekiyorsa kurum içinde barındırılan model.
- Kaynak uydurma, sayısal halüsinasyon, yanlış atıf, klinik yanlış bilgi ve kişisel veri sızıntısı için test kümesi ve düzenli regresyon testi.
- Üretilmiş metnin özgünlük, şeffaf yapay zekâ bildirimi ve üniversite kuralları açısından danışmanla değerlendirilmesi.

## Bilinçli olarak yapılmayanlar

- Eksik hasta verisi veya sonuçlarını uydurarak bir tezi tamamlanmış gibi gösterme.
- Etik kurul onayı, örneklem büyüklüğü, analiz, p değeri, tablo ya da kaynak uydurma.
- Kimlik bilgisi içeren hasta düzeyi veriyi model sağlayıcısına otomatik gönderme.
- Modelin çıktısını kaynak/doğruluk kontrolü yapılmış akademik metin olarak sunma.
- API anahtarını tarayıcıya, kaynak koduna veya GitHub'a koyma.
