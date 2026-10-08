# MPFI પેટ્રોલ એન્જિન – Blogger (Blogspot) પર મૂકવાની રીત

`mpfi-engine-blogger-post.html` એ Blogger પોસ્ટમાં સીધું પેસ્ટ કરી શકાય તેવો તૈયાર કોડ છે.
મૂળ મોડલ: [MPFI-Petrol-Engine-3D](https://github.com/Ashish119055/MPFI-Petrol-Engine-3D) (`mpfi-engine-source.html` તેની નકલ છે).

## પોસ્ટમાં મૂકવાના સ્ટેપ

1. Blogger ડેશબોર્ડ → **New Post** (નવી પોસ્ટ).
2. ડાબી બાજુ ઉપર પેન્સિલ આઇકન પર ક્લિક કરી **HTML view** પસંદ કરો (Compose view નહીં).
3. `mpfi-engine-blogger-post.html` ખોલો → બધું (Ctrl+A) કોપી કરો → HTML view માં પેસ્ટ કરો.
   ઉપર/નીચે તમારું લખાણ ઉમેરવું હોય તો આ કોડની બહાર ઉમેરો.
4. જમણી બાજુ **Post settings → Options** માં **"Interpret typed HTML"** પસંદ છે તેની ખાતરી કરો
   ("Show HTML literally" નહીં).
5. **Preview** માં મોડલ ચાલે છે તે જુઓ, પછી **Publish**.

નોંધ:
- પેસ્ટ કર્યા પછી Compose view માં જઈ કોડ એડિટ ન કરો; ફેરફાર કરવો હોય તો HTML view માં જ કરો.
- મોડલ એક અલગ ફ્રેમમાં ચાલે છે, એટલે બ્લોગની થીમ તેનો દેખાવ બગાડતી નથી અને ફ્રેમની ઊંચાઈ આપમેળે ગોઠવાય છે.
- 3D માટે three.js (cdnjs) અને Gujarati ફોન્ટ (Google Fonts) ઇન્ટરનેટ પરથી લોડ થાય છે.

## In English

Open a new Blogger post, switch to **HTML view**, paste the entire contents of
`mpfi-engine-blogger-post.html`, preview, and publish. Don't edit the snippet in Compose view.

The snippet embeds the page base64-encoded on a single line and loads it into an auto-sizing
`srcdoc` iframe, so the blog theme's CSS can't restyle the model, Blogger's editor can't mangle the
code, and the 3D stage still sizes to 68% of the reader's screen height.

## Rebuilding after the model changes

```sh
cp ../MPFI-Petrol-Engine-3D/index.html blogger/mpfi-engine-source.html
node blogger/build.js blogger/mpfi-engine-source.html blogger/mpfi-engine-blogger-post.html \
  mpfi-engine-3d "MPFI પેટ્રોલ એન્જિન – 3D વર્કિંગ મોડલ"
```

`build.js` works for any single-file page (e.g. this repo's `index.html`); pass a different embed id per post.

## Publishing through the Blogger API (optional)

`publish.js` posts the snippet without opening Blogger, given a token with the
`https://www.googleapis.com/auth/blogger` scope in environment variables:

```sh
BLOGGER_BLOG_URL=https://<your-blog>.blogspot.com \
BLOGGER_CLIENT_ID=... BLOGGER_CLIENT_SECRET=... BLOGGER_REFRESH_TOKEN=... \
node blogger/publish.js blogger/mpfi-engine-blogger-post.html "MPFI પેટ્રોલ એન્જિન – 3D વર્કિંગ મોડલ"
```

Add `--draft` to create a draft instead of publishing. `BLOGGER_ACCESS_TOKEN` can replace the
three OAuth client variables for a one-off run (access tokens expire after an hour).
