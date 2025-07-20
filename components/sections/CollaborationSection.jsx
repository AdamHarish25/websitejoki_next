import { icons } from "lucide-react";
import Image from "next/image";

export default function CollaborationSection() {
    const points = [
        {
            icons: "/icons/gear.svg",
            title: "Perencanaan Terstruktur",
            description: "Setiap proyek kami mulai dengan riset dan strategi yang matang untuk memastikan hasil yang terukur dan sesuai target."
        },

        {
            icons: "/icons/star.svg",
            title: "Hasil Kreatif Nyata",
            description: "Kami tidak hanya membuat desain yang indah, tapi juga solusi fungsional yang benar-benar bekerja dan memberikan nilai."
        }
    ]

    return (
        <section id="kolaborasi" className="container grid grid-cols-1 md:grid-cols-2 place-items-center gap-8 p-6 mx-auto">
            <div className="relative w-full">
                <Image
                    src="/Collaborate.png"
                    alt="Kolaborasi"
                    width={600}
                    height={600}
                    className=" object-cover rounded-3xl shadow-lg"
                />
            </div>

            <div className="space-y-4 grid place-content-end w-full p-0">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
                    Partner Kolaborasi Kreatif Anda
                </h2>
                <p className="text-gray-600 text-lg">
                    Kami mengubah konsep menjadi solusi nyata melalui proses yang terencana dan eksekusi yang kreatif.
                </p>

                <ul className="space-y-4">
                    {points.map((point, index) => (
                        <li key={index} className="flex flex-col md:flex-row items-start space-y-6 md:space-x-6 bg-[#2ECC71]/15 p-6 rounded-lg shadow-md transition-transform hover:-translate-y-1">
                            <div className="h-10 w-20 bg-[#2ECC71] text-white flex items-center justify-center rounded-md">
                                <Image src={point.icons} alt={point.title} width={30} height={30} />
                            </div>
                            <div className="space-y-2">
                                <h3 className="font-semibold text-gray-800 text-xl">{point.title}</h3>
                                <p className="text-gray-600 text-lg">{point.description}</p>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}