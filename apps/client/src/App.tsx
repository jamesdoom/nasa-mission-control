import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { AppShell } from "./components/AppShell";
import { RouteErrorPage } from "./components/RouteErrorPage";
import { DashboardPage } from "./pages/DashboardPage";
import { loadLazyRoute } from "./utils/lazyRoute";

const router = createBrowserRouter([
  {
    element: <AppShell />,
    errorElement: <RouteErrorPage />,
    children: [
      { index: true, element: <DashboardPage /> },
      {
        path: "apod",
        lazy: async () => ({
          Component: (await loadLazyRoute(() => import("./pages/ApodPage")))
            .ApodPage,
        }),
      },
      {
        path: "asteroids",
        lazy: async () => ({
          Component: (
            await loadLazyRoute(() => import("./pages/AsteroidsPage"))
          ).AsteroidsPage,
        }),
      },
      {
        path: "asteroids/:asteroidId",
        lazy: async () => ({
          Component: (
            await loadLazyRoute(() => import("./pages/AsteroidDetailPage"))
          ).AsteroidDetailPage,
        }),
      },
      {
        path: "media",
        lazy: async () => ({
          Component: (
            await loadLazyRoute(() => import("./pages/MediaLibraryPage"))
          ).MediaLibraryPage,
        }),
      },
      {
        path: "media/:nasaId",
        lazy: async () => ({
          Component: (
            await loadLazyRoute(() => import("./pages/MediaDetailPage"))
          ).MediaDetailPage,
        }),
      },
      {
        path: "space-weather",
        lazy: async () => ({
          Component: (
            await loadLazyRoute(() => import("./pages/SpaceWeatherPage"))
          ).SpaceWeatherPage,
        }),
      },
      {
        path: "earth",
        lazy: async () => ({
          Component: (await loadLazyRoute(() => import("./pages/EarthPage")))
            .EarthPage,
        }),
      },
      {
        path: "missions",
        lazy: async () => ({
          Component: (await loadLazyRoute(() => import("./pages/MissionsPage")))
            .MissionsPage,
        }),
      },
      {
        path: "missions/:missionSlug",
        lazy: async () => ({
          Component: (
            await loadLazyRoute(() => import("./pages/MissionDetailPage"))
          ).MissionDetailPage,
        }),
      },
      {
        path: "trivia",
        lazy: async () => ({
          Component: (await loadLazyRoute(() => import("./pages/TriviaPage")))
            .TriviaPage,
        }),
      },
      {
        path: "discover",
        lazy: async () => ({
          Component: (
            await loadLazyRoute(() => import("./pages/DiscoveryPage"))
          ).DiscoveryPage,
        }),
      },
      {
        path: "favorites",
        lazy: async () => ({
          Component: (
            await loadLazyRoute(() => import("./pages/FavoritesPage"))
          ).FavoritesPage,
        }),
      },
      {
        path: "about",
        lazy: async () => ({
          Component: (await loadLazyRoute(() => import("./pages/AboutPage")))
            .AboutPage,
        }),
      },
      {
        path: "*",
        lazy: async () => ({
          Component: (await loadLazyRoute(() => import("./pages/NotFoundPage")))
            .NotFoundPage,
        }),
      },
    ],
  },
]);
export function App() {
  return <RouterProvider router={router} />;
}
