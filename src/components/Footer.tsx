import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="flex fixed bottom-0 left-0  right-0 mt-auto items-center justify-end gap-2 px-6 py-4 bg-white border-t border-gray-100">
      <span className="text-sm text-muted-foreground">Powered by</span>
      <Image
        src="/Neuralogic Logo.svg"
        alt="Neuralogic Logo"
        width={20}
        height={20}
        className="w-5 h-5"
      />
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Neuralogic</span>
    </footer>
  );
}
