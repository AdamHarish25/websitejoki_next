import Image from 'next/image';

export default function ServiceCard({ title, description, image, alt, className }) {
    return (
        <div className={`group relative flex flex-col justify-between overflow-hidden rounded-3xl bg-[#ecfccb]/30 p-8 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl dark:bg-gray-800/50 dark:hover:shadow-gray-900/30 ${className}`}>
            {/* Background decoration */}
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-green-200/20 blur-3xl transition-all duration-500 group-hover:bg-green-300/30 dark:bg-green-900/10" />

            <div className="relative z-10 flex flex-col gap-4">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {title}
                </h3>
                <p className="text-base leading-relaxed text-gray-600 dark:text-gray-300">
                    {description}
                </p>
            </div>

            <div className="relative mt-8 h-48 w-full">
                <Image
                    src={image}
                    alt={alt || title}
                    fill
                    className="object-contain object-bottom transition-transform duration-500 group-hover:scale-105 drop-shadow-lg"
                />
            </div>
        </div>
    );
}
