# Tez Yazım Stüdyosu

Gerekli tez bilgileri, doğrulanmış kaynak notları ve kimliksizleştirilmiş çalışma bulguları verildiğinde **seçili tez bölümleri için taslak hazırlamaya** yönelik HTML uygulaması. Proje takibi veya ilerleme dashboard'u değildir.

## Ne yapar?

- Başlangıçta kolelitiazisli çocuklara ilişkin tez taslağını yükler; başlık, amaç, tasarım, dönem, yaş aralığı, kaynakça ve yazım kılavuzu notları düzenlenebilir.
- Giriş ve Amaç, Genel Bilgiler, Gereç ve Yöntem, Bulgular, Tartışma, Sonuç ve Öneriler, Özet ve Kaynakça arasından bölüm seçtirir.
- Bulgular, tartışma ve özet gibi bölümler için analiz edilmiş gerçek sonuçlar yoksa üretimi durdurur. Kaynak gerektiren bölümlerde bibliyografya ile kaynak notları ister.
- Etik kurul, protokol ve analiz planı gibi eksikleri tamamlanmış gibi göstermez; taslak alanları işaretler.
- Metinleri bu tarayıcı oturumunda düzenlemeye, kopyalamaya ve Markdown olarak indirmeye izin verir. Kaynakça seçeneği girilen künyeleri aynen aktarır; kaynakları doğrulamaz veya otomatik biçimlendirme yapmaz. İstenirse tüm taslak JSON olarak dışa aktarılıp yeniden açılabilir.
- Kaynak, atıf, etik kararı, hasta bulgusu veya istatistik doğrulaması yapmaz; bunların uydurulmaması için üretim talimatları ve bölüm kapıları uygular.

## Başlatma

Python 3.10 veya üstü yeterlidir; üçüncü taraf Python paketi gerekmez.

```bash
cd /home/user/tez-yazimi
python3 server.py
```

Tarayıcıda `http://127.0.0.1:4173` adresini açın. Model yapılandırılmamışsa başlangıç profili, kontroller, yerel Kaynakça bölümü, JSON içe/dışa aktarma ve metin indirme çalışır; yapay zekâ bölümü **üretmez** ve hazırmış gibi göstermez.

Arena canlı önizlemesi veya kapsayıcı içinden erişim gerekiyorsa:

```bash
python3 server.py --host 0.0.0.0 --port 4173
```

Bu sunucu geliştirme ve yerel kullanım içindir. Kimlik doğrulaması olmadan genel internete açmayın.

## Model bağlantısını yapılandırma

Uygulama, anahtarı HTML veya tarayıcı koduna koymadan sunucu tarafında OpenAI Chat Completions ile uyumlu bir uç noktaya istek gönderir. Sunucu açılmadan önce ortam değişkenlerini güvenli biçimde ayarlayın:

```bash
export LLM_API_KEY="sağlayıcının anahtarı"
export LLM_API_BASE_URL="https://api.openai.com/v1"
export LLM_MODEL="gpt-4.1-mini"
python3 server.py
```

Uyumlu başka bir sağlayıcı kullanılıyorsa `LLM_API_BASE_URL` ve `LLM_MODEL` o sağlayıcının değerleriyle değiştirilmelidir. Model adı varsayılanı, erişiminiz olduğu anlamına gelmez. PowerShell'de `export` yerine `$env:LLM_API_KEY`, `$env:LLM_API_BASE_URL` ve `$env:LLM_MODEL` kullanın. Ortam değişkenlerini bir gizli bilgi yöneticisi veya güvenli terminal oturumu üzerinden sağlayın; gerçek anahtarı kaynak koda, HTML/JavaScript'e, starter JSON'a, issue/sohbete ya da GitHub'a eklemeyin. Projede `.env` dosyası okunmaz.

Model durumu sayfanın üstünde görüntülenir. İstekler tek bölüm halinde sunucuya ve oradan yapılandırdığınız sağlayıcıya gider. Sağlayıcıya çalışma metni gönderilmeden önce, kurum ve etik süreçlerinizin bu kullanıma izin verdiğinden emin olun. Sağlayıcı; saklama, eğitim ve veri işleme koşulları açısından ayrıca incelenmelidir. API anahtarı tarayıcıya dönmez. Sunucu, tez metnini diske kaydetmez; sağlayıcı yanıt gövdelerini ve anahtarları loglamaz.

Sunucu aynı istemciden 10 dakikada en fazla 24 üretim isteğine izin verir. Oturum doğrulama belirteci yalnızca sayfa ile yerel sunucu arasındaki istekleri korur; kullanıcı hesabı/kimlik doğrulaması veya genel kullanıma uygun erişim kontrolü değildir.

## Gizlilik ve bilimsel kullanım

- **Hasta düzeyinde veri, hasta adı, T.C. kimlik numarası, protokol/dosya numarası, doğum tarihi veya tanınabilir serbest metin girmeyin.** Yalnızca kurum ve mevzuat kurallarına uygun kimliksizleştirilmiş toplu/özet bulguları girin. Arayüz, geçerli biçime benzeyen 11 haneli T.C. kimlik numaralarını temel bir taramayla engeller; bu tarama diğer tanımlayıcıları bulmayı garanti etmez.
- Metin, üretim sırasında yapılandırılmış model sağlayıcısına iletilir. Tarayıcıda otomatik saklama yoktur; sayfa yenilenince taslak ve üretilen bölümler silinir. JSON dışa aktarma dosyası çalışma bilgilerini ve üretilen metinleri içerebilir; dosyayı güvenli saklayın.
- `.txt`, `.md` ve `.csv` dosyaları yalnızca tarayıcıda okunup Bulgular alanına eklenir; dosya doğrudan sunucuya yüklenmez. Ham hasta çizelgesi değil, kimliksizleştirilmiş özet kullanın.
- Başlangıç profilindeki dahil/dışlama ölçütleri ve yöntem/analiz önerileri **taslaktır**; onaylı protokolle eşleştirilmelidir. Etik kurul ayrıntılarını kullanıcı eklemelidir.
- Başlangıç kaynak notları tam metin incelemesinin yerine geçmez. DOI, sayfa, bibliyografik künye ve her akademik iddia asıl kaynaklardan doğrulanmalıdır; model kaynak doğrulaması yapmaz. Atıf numaralarını SBÜ kılavuzuna göre metindeki ilk geçiş sırasına getirin.
- Çıktı akademik yazım desteği için düzenlenebilir bir taslaktır; bilimsel doğruluk, etik uygunluk, istatistik, kurum biçimi ve danışman onayı kullanıcı sorumluluğundadır.

## Dosyalar

- `index.html`, `styles.css`, `app.js` — tarayıcı arayüzü ve istemci tarafı iş akışı.
- `server.py` — yerel statik sunucu, model durumu ve API anahtarını koruyan sunucu tarafı üretim köprüsü.
- `data/starter-project.json` — önceden doldurulmuş tez profili, kaynakça ve kaynak notları.
- `ROADMAP.md` — yazım otomasyonuna göre hazırlanmış yol haritası.

Testleri çalıştırmak için:

```bash
python3 -m unittest discover -s tests -v
node --check app.js
git diff --check
```
