import { db } from '@/lib/firebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { notFound } from 'next/navigation';
import ServiceClientPage from './ServiceClientPage';

// --- DATA FETCHING ---
async function getService(slug) {
  const q = query(collection(db, "services"), where("slug", "==", slug));
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    notFound();
  }
  const serviceData = querySnapshot.docs[0].data();
  if (serviceData.published !== true) {
    notFound();
  }
  return {
    ...serviceData,
    createdAt: serviceData.createdAt?.toDate ? serviceData.createdAt.toDate().toISOString() : new Date().toISOString(),
    updatedAt: serviceData.updatedAt?.toDate ? serviceData.updatedAt.toDate().toISOString() : null
    // Serialize date for client component
  };
}

// --- SEO METADATA ---
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const service = await getService(slug);

  if (!service) {
    return {
      title: "Layanan Tidak Ditemukan",
      description: "Halaman layanan yang Anda cari tidak ada.",
    };
  }

  return {
    title: `${service.title} | WebsiteJoki.ID`,
    description: service.shortDescription,
    openGraph: {
      title: service.title,
      description: service.shortDescription,
      images: service.heroImageUrl ? [{ url: service.heroImageUrl }] : [],
    },
  };
}

// --- SSG ---
export async function generateStaticParams() {
  const servicesCol = collection(db, 'services');
  const q = query(servicesCol, where("published", "==", true));
  const serviceSnapshot = await getDocs(q);

  const paths = serviceSnapshot.docs.map(doc => ({
    slug: doc.data().slug || '',
  })).filter(path => path.slug);

  return paths;
}

export const revalidate = 60;

// --- PAGE COMPONENT ---
export default async function ServiceDetailPage({ params }) {
  const { slug } = await params;
  const service = await getService(slug);

  return <ServiceClientPage service={service} />;
}