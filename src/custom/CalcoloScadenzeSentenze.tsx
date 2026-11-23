// @ts-nocheck
import { customTicker, customTimers } from "../customGuard.ts";
const __mk = customTicker("CalcoloScadenzeSentenze");
const { setTimeout, setInterval, clearTimeout, clearInterval } = customTimers("CalcoloScadenzeSentenze");
import { useEffect } from "react";
import { useTable, type SectionProps } from "../floware";

function leggiData(testo: string) {__mk();
  if (!testo || testo.length !== 10) return null;
  const data = new Date(testo + "T00:00:00Z");
  if (isNaN(data.getTime()) || data.toISOString().slice(0, 10) !== testo) return null;
  return data;
}

function scadenza(pubblicazione: string, notifica: string) {__mk();
  const notificata = notifica.trim() !== "" && notifica.trim().toLowerCase() !== "non notificata";
  const data = leggiData(notificata ? notifica : pubblicazione);
  if (!data) return "";
  if (notificata) {
    data.setUTCDate(data.getUTCDate() + 30);
  } else {
    const giorno = data.getUTCDate();
    data.setUTCDate(1);
    data.setUTCMonth(data.getUTCMonth() + 6);
    const ultimo = new Date(Date.UTC(data.getUTCFullYear(), data.getUTCMonth() + 1, 0)).getUTCDate();
    data.setUTCDate(Math.min(giorno, ultimo));
  }
  data.setUTCDate(data.getUTCDate() + 120);
  return data.toISOString().slice(0, 10);
}

export default function CalcoloScadenzeSentenze({ pageId }: SectionProps) {__mk();
  const registro = useTable("sentenze");
  const modulo = useTable("nuova-sentenza");
  useEffect(() => {__mk();
    for (const tabella of [registro, modulo]) {__mk();
      if (!tabella) continue;
      if (tabella.column("Data pubblicazione") < 0 || tabella.column("Data notifica") < 0 || tabella.column("Scadenza calcolata") < 0) continue;
      tabella.rows.forEach((riga, indice) => {__mk();
        const risultato = scadenza(tabella.value(riga, "Data pubblicazione"), tabella.value(riga, "Data notifica"));
        if (tabella.value(riga, "Scadenza calcolata") !== risultato) tabella.setCell(indice, "Scadenza calcolata", risultato);
      });
    }
  }, [registro, modulo]);
  if (pageId !== "sentenze" && pageId !== "nuova-sentenza") return null;
  return <div className="rounded-lg border border-(--mk-border) bg-(--mk-subtle) p-4 text-(--mk-text)"><p className="font-semibold">Scadenza automatica</p><p className="text-sm">Con notifica: 30 giorni dalla notifica, poi altri 120 giorni. Senza notifica: 6 mesi dalla pubblicazione, poi altri 120 giorni.</p><p className="text-sm text-(--mk-muted)">I mesi sono di calendario; se il giorno non esiste nel mese di arrivo, si usa l’ultimo giorno del mese. Nessun adeguamento per festività o sospensioni.</p></div>;
}
