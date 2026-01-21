# Esempio di Refactoring con Orval

Dopo aver eseguito `pnpm gen:api`, Orval genererà degli hook TanStack Query basati sui tag del tuo Swagger.
Ecco come trasformare `PlayerList.tsx` per usare l'hook generato.

### Prima (Chiamata manuale)
```tsx
import { useQuery } from "@tanstack/react-query";
import { getPlayers } from "@/api/players";

// ...

export const PlayerList = () => {
  const { data: players, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["players"],
    queryFn: getPlayers,
  });
  // ...
}
```

### Dopo (Con Orval)
```tsx
import { useGetPlayers } from "@/api/generated/players";

// ...

export const PlayerList = () => {
  // L'hook generato da Orval include già il tipo di ritorno corretto
  // e la configurazione di TanStack Query.
  const { data: players, isLoading, isError, refetch, isFetching } = useGetPlayers();

  // Se hai bisogno di passare opzioni alla query:
  // const { data } = useGetPlayers({ query: { enabled: !!someCondition } });

  // ... rest of the component
}
```

### Vantaggi:
1. **Type Safety:** `players` sarà automaticamente tipizzato secondo lo schema del Backend.
2. **Auto-Completion:** Gli endpoint e i parametri sono suggeriti dall'IDE.
3. **Meno Boilerplate:** Non devi più scrivere `queryKey` o definire le interfacce manualmente.
