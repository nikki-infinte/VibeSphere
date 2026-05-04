import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const FavoritesContext = createContext(null);

function getStorageKey(userId) {
  return userId ? `favorites_${userId}` : 'favorites_guest';
}

export function FavoritesProvider({ children, userId }) {
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(getStorageKey(userId));
      setFavorites(stored ? JSON.parse(stored) : []);
    } catch {
      setFavorites([]);
    }
  }, [userId]);

  useEffect(() => {
    localStorage.setItem(getStorageKey(userId), JSON.stringify(favorites));
  }, [favorites, userId]);

  const favoriteIds = useMemo(
    () => new Set(favorites.map((event) => Number(event.id))),
    [favorites]
  );

  const isFavorite = (eventId) => favoriteIds.has(Number(eventId));

  const toggleFavorite = (event) => {
    const id = Number(event.id);
    setFavorites((prev) => {
      if (prev.some((item) => Number(item.id) === id)) {
        return prev.filter((item) => Number(item.id) !== id);
      }
      return [event, ...prev];
    });
  };

  const removeFavorite = (eventId) => {
    const id = Number(eventId);
    setFavorites((prev) => prev.filter((item) => Number(item.id) !== id));
  };

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        favoriteCount: favorites.length,
        isFavorite,
        toggleFavorite,
        removeFavorite,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export const useFavorites = () => useContext(FavoritesContext);
