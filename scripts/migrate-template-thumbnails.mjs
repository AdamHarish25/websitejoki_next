/**
 * Migration script: Update template thumbnailUrl dari local path ke Cloudinary URL
 * 
 * Pattern: https://res.cloudinary.com/dxpuz7mha/image/upload/templates/{slug}.jpg
 * 
 * Cara pakai:
 *   node scripts/migrate-template-thumbnails.mjs
 */
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .env.local manually
const envPath = resolve(__dirname, '../.env.local');
const envContent = readFileSync(envPath, 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) return;
  const [key, ...rest] = trimmed.split('=');
  const value = rest.join('=').replace(/^["']|["']$/g, '');
  env[key.trim()] = value;
});

const firebaseConfig = {
  apiKey: env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const CLOUDINARY_BASE = 'https://res.cloudinary.com/dxpuz7mha/image/upload';

// Map: local path slug → Cloudinary folder slug (sama)
const SLUG_MAP = {
  'startup-agency': 'startup-agency',
  'global-company': 'global-company',
  'resto-cafe': 'resto-cafe',
  'klinik': 'klinik',
  'toko-online': 'toko-online',
  'sekolah': 'sekolah',
  'portfolio-creator': 'portfolio-creator',
  'premium-custom': 'premium-custom',
};

async function main() {
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  console.log('🔍 Fetching templates from Firestore...');
  const snap = await getDocs(collection(db, 'templates'));

  if (snap.empty) {
    console.log('❌ No templates found in Firestore. Run seedCollections.mjs first.');
    process.exit(1);
  }

  console.log(`📦 Found ${snap.size} templates\n`);

  let updated = 0;
  let skipped = 0;

  for (const d of snap.docs) {
    const data = d.data();
    const oldUrl = data.thumbnailUrl || '';

    // Extract slug from old URL: "/templates/startup-agency.jpg" → "startup-agency"
    const match = oldUrl.match(/\/templates\/(.+?)\.\w+$/);
    if (!match) {
      console.log(`  ⏭  ${data.name} — URL pattern not recognized: "${oldUrl}"`);
      skipped++;
      continue;
    }

    const slug = match[1];
    const cloudinaryUrl = `${CLOUDINARY_BASE}/templates/${slug}.jpg`;

    // Skip jika sudah Cloudinary URL
    if (oldUrl.startsWith(CLOUDINARY_BASE)) {
      console.log(`  ✅ ${data.name} — already Cloudinary`);
      skipped++;
      continue;
    }

    console.log(`  🔄 ${data.name}`);
    console.log(`     OLD: ${oldUrl}`);
    console.log(`     NEW: ${cloudinaryUrl}`);

    await updateDoc(doc(db, 'templates', d.id), {
      thumbnailUrl: cloudinaryUrl,
      updatedAt: new Date(),
    });

    updated++;
  }

  console.log(`\n✨ Done! Updated: ${updated}, Skipped: ${skipped}`);
  process.exit(0);
}

main().catch(err => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
