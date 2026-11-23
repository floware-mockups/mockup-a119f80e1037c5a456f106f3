// @ts-nocheck
import { customTicker, customTimers } from "../customGuard.ts";
const __mk = customTicker("ConfermaRegistrazioneSentenza");
const { setTimeout, setInterval, clearTimeout, clearInterval } = customTimers("ConfermaRegistrazioneSentenza");
import { Button, Dialog, Field, usePrototype, useTable, type ConfirmProps } from "../floware";

function leggiData(testo: string) {__mk();
  if (!testo || testo.length !== 10) return null;
  const data = new Date(testo + "T00:00:00Z");
  if (isNaN(data.getTime()) || data.toISOString().slice(0, 10) !== testo) return null;
  return data;
}

function calcola(pubblicazione: string, notifica: string) {__mk();
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

export default function ConfermaRegistrazioneSentenza({ action, cancel }: ConfirmProps) {__mk();
  const origine = useTable(action.pageId);
  const registro = useTable("sentenze");
  const { notify } = usePrototype();
  const colonne = ["Riferimento sentenza", "Violazione", "Organizzazione", "Data pubblicazione", "Data notifica", "Importo spese", "Data pagamento", "Scadenza calcolata"];
  const disponibile = origine && registro && colonne.every((nome) => (__mk(), origine.column(nome) >= 0 && registro.column(nome) >= 0));
  const leggi = (nome: string) => (__mk(), origine && origine.column(nome) >= 0 ? origine.value(action.row, nome) : "");
  const pubblicazione = leggi("Data pubblicazione");
  const notifica = leggi("Data notifica");
  const termine = calcola(pubblicazione, notifica);
  const riferimento = leggi("Riferimento sentenza").trim();
  const duplicata = registro && riferimento ? registro.findRows("Riferimento sentenza", riferimento).length > 0 : false;
  const valido = Boolean(disponibile && riferimento && leggiData(pubblicazione) && termine && !duplicata);
  function registra() {__mk();
    if (!valido || !registro) return;
    const valori: { [nome: string]: string } = {};
    for (const nome of colonne) {__mk();valori[nome] = leggi(nome);}
    valori["Riferimento sentenza"] = riferimento;
    valori["Data notifica"] = notifica.trim() || "Non notificata";
    valori["Data pagamento"] = leggi("Data pagamento") || "Non registrato";
    valori["Scadenza calcolata"] = termine;
    registro.addRow(valori);
    cancel();
    notify("Sentenza aggiunta al Registro sentenze con scadenza calcolata.");
  }
  return <Dialog title="Registra sentenza nel registro" onClose={cancel} footer={<><Button variant="secondary" onClick={cancel}>Annulla</Button><Button onClick={registra} disabled={!valido}>Registra sentenza</Button></>}><div className="space-y-3"><Field label="Riferimento sentenza">{riferimento || "Mancante"}</Field><Field label="Scadenza calcolata">{termine || "Date mancanti o non valide"}</Field><p className="text-sm text-(--mk-muted)">La sentenza sarà inserita direttamente nel Registro sentenze. La scadenza non deve essere compilata.</p>{!disponibile && <p>Registro o colonne necessarie non disponibili.</p>}{!leggiData(pubblicazione) && <p>Indica una data di pubblicazione valida nel modulo.</p>}{!termine && <p>Indica date valide; lascia vuota la notifica se assente.</p>}{!riferimento && <p>Indica il riferimento della sentenza.</p>}{duplicata && <p>Il riferimento è già presente nel registro.</p>}</div></Dialog>;
}
