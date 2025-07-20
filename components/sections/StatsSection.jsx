import { Users, Clock, Star } from 'lucide-react';

export default function StatsSection() {
  const stats = [
    { icon: <Users size={40} />, value: "100+", label: "Klien Puas Pada Kami" },
    { icon: <Clock size={40} />, value: "5+", label: "Tahun Pengalaman" },
    { icon: <Star size={40} />, value: "95+", label: "Review Positif Dari Mereka" },
  ];
  return (
    <section className="bg-green-600 text-white">
      <div className="container mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
        {stats.map((stat, index) => (
          <div key={index} className="flex flex-col items-center">
            <div className="mb-3">{stat.icon}</div>
            <p className="text-4xl font-bold">{stat.value}</p>
            <p className="text-green-200">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}