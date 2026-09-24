# NSC Clothing Store — paanch fix, ek folder

Ye folder kholein. Andar sirf DO cheezein hain:

```
src           ← folder
package.json  ← file
```

**Dono ko ek sath uthayein aur GitHub par chhor dein. Bas.**

GitHub baaqi raasta khud bana leta hai — `src/app/layout.js`,
`src/styles/compat.css`, sab apni sahi jagah par chala jata hai, aur
purani file ke upar naya likha jata hai. Baaqi 100+ file ko chherne ki
zaroorat nahi.

---

## Karna kya hai — teen qadam

**1.** GitHub par `nsc-store` repo kholein
→ `Add file` → `Upload files`

**2.** Is folder mein se **`src` ka folder** aur **`package.json`**
dono select karein (`src` par click, phir `Ctrl` dabaye rakh kar
`package.json` par click) aur dono ko us safed khane mein chhor dein.

> ⚠ **`src` ke ANDAR ja kar us ka saman nahi uthana.** `src` ka
> folder KHUD uthana hai. Pichhli dafa andar ka saman uthaya gaya tha
> aur `app`, `lib`, `components` repo ki jar par chale gaye thay —
> poora build gir gaya tha.

**3.** Neeche `Commit changes` ka sabz button dabayein.

Vercel khud dekh leta hai. Do se teen minute mein
**nscclothingstore.com** refresh karein — sab kuch naya.

---

## Kitni file ja rahi hain — 17

| Kaam | File |
|---|---|
| Rang | `src/lib/constants.js` |
| Rang — admin ka form | `src/components/admin/ProductForm.jsx` |
| Rang — product ka safha | `src/components/shop/ProductDetail.jsx` |
| Rang — card ka quick add | `src/components/shop/ProductCard.jsx` |
| Rang — "In Focus" wala khana | `src/components/home/Spotlight.jsx` |
| Admin nav bar mein | `src/components/layout/Header.jsx` |
| Footer se dono button nikle | `src/components/layout/Footer.jsx` |
| Upar jane wala naya button | `src/components/layout/BackToTop.jsx` ✦ |
| Safha upar se khule | `src/components/layout/ScrollTop.jsx` ✦ |
| Dono naye button mount | `src/app/layout.js` |
| Smooth ka masla | `src/styles/base.css` |
| Smooth ka masla (doosri jagah) | `src/styles/components.css` |
| Purane phone + narmi | `src/styles/compat.css` ✦ |
| Nayi file jori | `src/app/globals.css` |
| Purane phone par admin panel | `src/app/admin/layout.js` |
| " | `src/components/admin/AdminBodyFlag.jsx` ✦ |
| Purane phone ke liye | `package.json` |

✦ = bilkul nayi file

`.env.local` is mein NAHI hai — aap ki chabiyan aap hi ke paas hain.

---

## Har fix — kya tha, kya kiya

### 1 · Rang ka masla

**Tha:** product add karte waqt pentees rang pehle se lage rehte thay
(Sage, Mint, Pistachio, Camel…). Aap ko apna rang unhi ke beech
dhoondna parta tha, aur naya naam likhne par site par uska nishan
bhoora aata tha — theek karne ke liye `constants.js` kholni parti thi.

**Ab:** wo pentees hat gaye. Khana khali shuru hota hai. Aap naam
likhte hain — jaise `Peach` — us ke baayein gol nishan daba kar ASAL
rang chunte hain, aur `Add`. Jo aap ne jora, bas wohi grahak ko nazar
aata hai. Rang baad mein badalna ho to chip ke gol nishan par daba
dein. `constants.js` ab kabhi kholni nahi paregi.

**Grahak ki taraf — ek asli kharabi bhi theek hui:** card par jo
"Quick add" tha, wo CHUPKE se pehla size aur pehla rang khud chun leta
tha. Yani kisi ne Maroon manga hi nahi, aur order Maroon ka chala
jata tha. Ab jahan chunne ko kuch hai, wahan wo jagah
**"Choose options"** ban jati hai jo product ke safhe par le jati hai.
Wohi "In Focus" wale khane mein bhi tha — wo bhi theek hua. Ek se
zyada rang hon to grahak ko chunna hi parta hai, warna button khud
kehta hai *"Select a colour"*.

### 2 · Purane phone

Char asli wajhein thin, char alag ilaj:

- **Sab se bari:** site ke jumle aur tasveerein shuru mein chhupi
  hoti hain aur JavaScript unhein kholti hai. Purane phone par
  JavaScript chalti hi na — to safha khulta tha, magar **bilkul
  khali**. Ab chhupane ka kaam ek nishan se bandha hai jo sirf tab
  lagta hai jab wo chhoti si qatar khud chal chuki ho. Na chali? Har
  tasveer, har lafz, har daam, har button — sab foran nazar aata hai.
- `100dvh` (naye naap) se pehle `100vh` rakha gaya.
- `:has()`, `aspect-ratio`, flex ka `gap`, `backdrop-filter` —
  in sab ke liye purana raasta saath rakha gaya.
- `package.json` mein browser ki list — CSS ab purane phone ke liye
  bhi theek bunti hai.

### 3 · Admin ka nishan, aur upar jane wala button

- **Admin** footer se nikal kar **upar ki patti mein** — sunehri
  dhaal, search aur bag ke saath, har naap par ek hi jagah.
  (Alt + A aur "admin" likhna, dono jaise thay waise chal rahe hain.)
- **Footer ka "Top"** poora nikal diya gaya. Us ki jagah ek naya gol
  button — **neeche BAAYEIN kone mein, WhatsApp ke theek saamne** —
  aur bilkul usi tarah banaya gaya: wohi gehri plate, wohi naap, wohi
  sunehri lakeer jo pehli dafa khud apna daira khinchti hai, wohi naam
  jo chhoone par khulta hai. Dabane par teer upar nikal kar doosri
  taraf se wapas aata hai aur daira ek dafa phir bhar jata hai.
- Sab se tang phone par ujala/andhera ka nishan patti se hat kar sirf
  menu ke andar reh jata hai (wahan pehle se tha) — taake admin ka
  nishan kabhi kinare se bahar na jaye.

### 4 · Phone par narmi

Teen cheezein har frame par phone ka processor kha rahi thin:

- **`blur()`** — header, WhatsApp, menu, cart, search, sab par. Phone
  par hata kar gehri plate lagayi gayi. Dekhne mein taqreeban wohi,
  chalne mein kai guna halka.
- **Parallax** — chhe poore safhe jitni tasveerein scroll ke sath
  apna alag safar karti thin. Phone par ye thehra di gayi hain.
  Nazar aane ka andaz wohi, bas hilti nahi.
- **Grain** — poore safhe par chalti hui roshnai. Phone par roshnai
  wahin hai, sirf uski harkat band. Ye akele har second paanch frame
  bachati hai.

Iske ilawa: bees `will-change` ki paratein phone par band (memory bhar
jati thi, phir har scroll par jhatka), hover ki tayyari chhoone wale
device par band, aur har chhone layak cheez kam az kam 44px — Apple
aur Google dono ka yehi naap hai. Chhote nishan par ungli phisalti
hai, aur phir lagta hai "button kaam hi nahi karta".

### 5 · Safha apne aakhir se khulta tha

Ye sab se saaf masla tha, aur wajah ek hi qatar thi:

```
html { scroll-behavior: smooth; }
```

Safha badalte hi browser upar jaane ki koshish karta hai — magar
`smooth` us koshish ko ek **animation** bana deta hai. Us animation ke
darmiyan purana safha gayab hota hai, safhe ki lambai achanak chhoti ho
jati hai, aur adhoori harkat wahin ruk jati hai. Yani **neeche**.

Wo qatar do jagah lagi hui thi (`base.css` aur `components.css`) —
dono nikal di gayin. Narmi ab sirf wahan hai jahan sach much chahiye:
"Top" ke button mein, JavaScript se.

Uske upar `ScrollTop.jsx` — har naye safhe par sifar par le aata hai,
**do dafa**: foran, aur agle frame par bhi (kyunke tasveerein baad mein
aati hain aur lambai badal deti hain). Peeche (back) jane par kuch
nahi chherta — wahan purani jagah par lautna hi theek hai.

---

## Upload ke baad ek dafa dekh lein

1. **nscclothingstore.com** — neeche scroll karein. Dono kinaron par
   gol button aane chahiyen: daayein WhatsApp, baayein upar jane wala.
   "Top" dabayein.
2. Koi collection kholein — **safha upar se shuru hona chahiye**.
3. Upar ki patti mein sunehri **shield** ka nishan — admin.
4. `/admin` → koi product edit karein → **Colour** ka khana. Sirf us
   product ke rang nazar aane chahiyen, aur ek `Add` wala khana.
5. Ek naya rang jorein — `Peach`, nishan narangi — save karein. Us
   product ke safhe par dekhein: nishan narangi hona chahiye,
   **bhoora nahi**.

Koi cheez ulti lage to bata dein — foran theek kar ke doosri file de
dunga.
