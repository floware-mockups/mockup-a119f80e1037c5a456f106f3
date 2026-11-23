// @ts-nocheck
import { customTicker, customTimers } from "../customGuard.ts";
const __mk = customTicker("FiltroScadenzeCondiviso");
const { setTimeout, setInterval, clearTimeout, clearInterval } = customTimers("FiltroScadenzeCondiviso");
import { useEffect, useState } from "react";
import { Button, Card, TextInput, usePrototype, useTable, type SectionProps } from "../floware";

const termineCondiviso = [""];
const ascoltatori: (() => void)[] = [];

function dataValida(testo: string) {__mk();
  if (!testo || testo.length !== 10) return false;
  const data = new Date(testo + "T00:00:00Z");
  return !isNaN(data.getTime()) && data.toISOString().slice(0, 10) === testo;
}

export default function FiltroScadenzeCondiviso({ pageId }: SectionProps) {__mk();
  const [termine, setTermine] = useState(termineCondiviso[0]);
  const registro = useTable("sentenze");
  const { openDetail } = usePrototype();
  useEffect(() => {__mk();
    const aggiorna = () => (__mk(), setTermine(termineCondiviso[0]));
    ascoltatori.push(aggiorna);
    aggiorna();
    return () => {__mk();
      const indice = ascoltatori.indexOf(aggiorna);
      if (indice >= 0) ascoltatori.splice(indice, 1);
    };
  }, []);
  function cambiaTermine(valore: string) {__mk();
    termineCondiviso[0] = valore;
    setTermine(valore);
    ascoltatori.forEach((aggiorna) => (__mk(), aggiorna()));
  }
  if (pageId !== "dashboard" && pageId !== "sentenze") return null;
  if (!registro || registro.column("Scadenza calcolata") < 0) return <p>Registro o colonna Scadenza calcolata non disponibili.</p>;
  const valido = dataValida(termine);
  const righe = registro.rows.map((riga, indice) => ((__mk(), { indice, scadenza: registro.value(riga, "Scadenza calcolata") })));
  const risultati = righe.filter((riga) => (__mk(), dataValida(riga.scadenza) && (!termine || (valido && riga.scadenza <= termine)))).sort((a, b) => (__mk(), a.scadenza.localeCompare(b.scadenza)));
  const senzaData = righe.filter((riga) => (__mk(), !dataValida(riga.scadenza))).length;
  const colonne = ["Riferimento sentenza", "Organizzazione", "Scadenza calcolata", "Importo spese"].filter((nome) => (__mk(), registro.column(nome) >= 0));
  return <Card title="Sentenze entro il termine"><div className="space-y-4 text-(--mk-text)"><p className="text-sm text-(--mk-muted)">Risultati dal Registro sentenze, inclusi i pagamenti già registrati. Il termine è incluso e resta condiviso tra le due pagine durante l’uso del prototipo.</p><div className="flex flex-wrap items-end gap-3"><TextInput label="Scadenza calcolata entro il" type="date" value={termine} onChange={cambiaTermine} /><Button variant="secondary" onClick={() => (__mk(), cambiaTermine(""))} disabled={!termine}>Mostra tutte</Button></div>{termine && !valido ? <p>Seleziona una data valida.</p> : <><p className="font-semibold">{risultati.length} sentenze{termine ? " entro il " + termine : " con scadenza valida"}</p>{risultati.length === 0 ? <p>Nessuna sentenza nel periodo selezionato.</p> : <div className="overflow-auto"><table className="w-full text-left text-sm"><thead><tr>{colonne.map((nome) => (__mk(), <th key={nome} className="border-b border-(--mk-border) p-2">{nome}</th>))}<th className="border-b border-(--mk-border) p-2">Dettaglio</th></tr></thead><tbody>{risultati.map((riga) => (__mk(), <tr key={riga.indice}>{colonne.map((nome) => (__mk(), <td key={nome} className="border-b border-(--mk-divider) p-2">{registro.value(riga.indice, nome)}</td>))}<td className="border-b border-(--mk-divider) p-2"><Button variant="link" onClick={() => (__mk(), openDetail("sentenze", riga.indice))}>Apri</Button></td></tr>))}</tbody></table></div>}</>}{senzaData > 0 && <p className="text-sm text-(--mk-muted)">Sentenze escluse perché prive di scadenza valida: {senzaData}.</p>}<p className="text-sm text-(--mk-muted)">Il filtro riguarda solo questo riquadro. Le tabelle originali restano complete; nessuna riga viene modificata o eliminata.</p></div></Card>;
}
