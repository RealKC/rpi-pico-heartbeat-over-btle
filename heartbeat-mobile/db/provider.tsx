import * as SQLite from "expo-sqlite";
import { drizzle, ExpoSQLiteDatabase } from "drizzle-orm/expo-sqlite";
import React, { PropsWithChildren, useContext } from "react";

const expo = SQLite.openDatabaseSync("db.db");
const db = drizzle(expo);

export const DatabaseContext = React.createContext({ db });

export const useDatabase = () => useContext(DatabaseContext);

export function DatabaseProvider({ children }: PropsWithChildren) {
  return (
    <DatabaseContext.Provider value={{ db }}>
      {children}
    </DatabaseContext.Provider>
  );
}
