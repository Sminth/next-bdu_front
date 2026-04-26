import { GalleryVerticalEnd } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center md:justify-start mb-8 md:mb-0">
          <a href="#" className="flex items-center gap-2 font-medium">
            <img src="/logo.png" alt="BDU-CI Logo" className="h-[70px] md:h-[90px] w-auto relative z-20" />
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-sm">
            {children}
          </div>
        </div>
      </div>
      <div className="relative hidden lg:block bg-primary overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#2c63a8] to-[#6da843] opacity-95"></div>
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-white opacity-5 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-[#6da843] opacity-20 blur-3xl"></div>

        <div className="absolute inset-0 flex flex-col justify-center p-16 text-white z-10">
          <h2 className="text-4xl font-bold mb-4 tracking-tight">Banque de l'Union <br /> Côte d'Ivoire</h2>
          <p className="text-lg opacity-90 max-w-md leading-relaxed">
            Accédez à votre espace d'administration sécurisé. Gérez vos opérations en toute sérénité avec notre plateforme dédiée.
          </p>
          <div className="mt-8 flex items-center gap-4">
            <div className="h-1 w-12 bg-white rounded-full"></div>
            <span className="text-sm font-medium tracking-wider uppercase opacity-80">Portail Sécurisé</span>
          </div>
        </div>
      </div>
    </div>
  );
}
