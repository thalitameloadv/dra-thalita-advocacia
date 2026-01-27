import { useState, useEffect } from "react";
import { User } from "lucide-react";

const names = [
  "Maria",
  "João",
  "Ana",
  "Carlos",
  "Francisca",
  "José",
  "Antônia",
  "Pedro",
  "Luciana",
  "Paulo",
  "Sandra",
  "Fernando",
  "Cláudia",
  "Roberto",
  "Patrícia"
];

const cities = [
  "Juazeiro do Norte",
  "Crato",
  "Barbalha",
  "Missão Velha",
  "Caririaçu",
  "Jardim",
  "Brejo Santo"
];

const SocialProofNotification = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [notification, setNotification] = useState({ name: "", city: "", time: "" });

  useEffect(() => {
    const showNotification = () => {
      const randomName = names[Math.floor(Math.random() * names.length)];
      const randomCity = cities[Math.floor(Math.random() * cities.length)];
      const randomMinutes = Math.floor(Math.random() * 10) + 1;
      
      setNotification({
        name: randomName,
        city: randomCity,
        time: `há ${randomMinutes} min`
      });
      
      setIsVisible(true);
      
      setTimeout(() => {
        setIsVisible(false);
      }, 5000);
    };

    // Initial delay before first notification
    const initialTimeout = setTimeout(showNotification, 8000);
    
    // Show notification every 15-25 seconds
    const interval = setInterval(() => {
      showNotification();
    }, Math.random() * 10000 + 15000);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, []);

  return (
    <div
      className={`fixed bottom-24 left-4 z-40 transition-all duration-500 ease-out ${
        isVisible 
          ? "translate-x-0 opacity-100" 
          : "-translate-x-full opacity-0"
      }`}
    >
      <div className="bg-background/95 backdrop-blur-sm border border-border rounded-lg shadow-elegant p-3 max-w-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <User className="w-5 h-5 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {notification.name} de {notification.city}
            </p>
            <p className="text-xs text-muted-foreground">
              solicitou uma consulta {notification.time}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SocialProofNotification;
