
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { QrCode } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center space-y-6 max-w-md p-6">
        <div className="flex justify-center">
          <div className="bg-primary/10 rounded-full p-4">
            <QrCode className="h-20 w-20 text-primary" />
          </div>
        </div>
        <h1 className="text-6xl font-bold text-gray-800">404</h1>
        <p className="text-xl text-gray-600 mb-4">Strona nie została znaleziona</p>
        <p className="text-gray-500">
          Przepraszamy, strona której szukasz nie istnieje lub została przeniesiona.
        </p>
        <Button asChild size="lg" className="mt-6">
          <a href="/">Powrót do strony głównej</a>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
