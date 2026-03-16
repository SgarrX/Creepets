import { supabase } from "../supabaseClient";

export default function Home() {
  return (
    <div>
      <h2>Help</h2>

      <div className="panel" style={{ marginBottom: 12 }}>
        <h3 style={{ marginTop: 0 }}>Willkommen in CritterTown</h3>
        <p>
          In CritterTown begleitest du ein kleines Wesen auf seinem Weg vom neugierigen
          Anfänger bis zum erfahrenen Gefährten. Dein Ziel ist es nicht, ein Monster zu
          besiegen oder die Welt zu retten, sondern dein Pet gut zu versorgen, stärker
          werden zu lassen und es Schritt für Schritt zu einem kleinen Helden des Alltags
          zu machen.
        </p>
        <p>
          Du kümmerst dich um Hunger, Energie und Laune, trainierst seine Fähigkeiten,
          erfüllst Quests und sammelst Fortschritt. Mit jeder Entscheidung wächst dein Pet
          ein Stück weiter. Es ist also weniger ein hektisches Spiel und mehr eine kleine
          Abenteuerreise mit Fürsorge, Planung und Belohnungen.
        </p>
      </div>

      <div className="panel" style={{ marginBottom: 12 }}>
        <h3 style={{ marginTop: 0 }}>Wie funktioniert das Spiel?</h3>
        <p>
          Der wichtigste Kreislauf ist einfach: Du versorgst dein Pet, erfüllst Quests,
          bekommst Erfahrungspunkte und steigerst dadurch dein Level. Zusätzlich kannst du
          dein Pet trainieren und seine Werte verbessern.
        </p>
        <p>
          Quests geben dir vor, was zu tun ist. Mal sollst du ein bestimmtes Item benutzen,
          mal Punkte im Minigame erreichen oder bestimmte Werte steigern. Wenn du Quests
          abschließt, erhält dein Pet Erfahrung und manchmal auch nützliche Belohnungen
          wie Items oder Stat-Upgrades.
        </p>
        <p>
          Das Minigame ist deine wichtigste Quelle für Coins. Diese Coins brauchst du,
          um im Shop neue Dinge zu kaufen. Je besser die Werte deines Pets sind, desto
          mehr Coins kann es im Minigame herausholen. Ein trainiertes Pet bringt also
          nicht nur Prestige, sondern auch mehr Beute nach Hause.
        </p>
      </div>

      <div className="panel" style={{ marginBottom: 12 }}>
        <h3 style={{ marginTop: 0 }}>Was bedeuten die Werte?</h3>
        <p>
          <b>Energy</b> zeigt, wie fit dein Pet gerade ist. Viele Aktionen kosten Energie,
          zum Beispiel Training oder das Minigame.
        </p>
        <p>
          <b>Hunger</b> zeigt, wie hungrig dein Pet ist. Mit der Zeit steigt dieser Wert.
          Futter senkt den Hunger wieder.
        </p>
        <p>
          <b>Happiness</b> ist die Laune deines Pets. Training ist anstrengend und drückt
          auf die Stimmung. Sinkt Happiness zu stark, kann dein Pet bestimmte Dinge nicht
          mehr tun.
        </p>
        <p>
          <b>STR</b> steht für Stärke. Das ist die körperliche Kraft deines Pets.
        </p>
        <p>
          <b>AGI</b> steht für Agility, also Beweglichkeit und Geschicklichkeit.
        </p>
        <p>
          <b>INT</b> steht für Intelligenz. Dieser Wert beschreibt, wie klug und lernfähig
          dein Pet ist.
        </p>
        <p>
          Alle drei Werte helfen deinem Pet, im Minigame bessere Coin-Belohnungen
          herauszuholen. Ein cleveres, flottes und starkes Wesen macht aus denselben
          Herausforderungen einfach mehr.
        </p>
      </div>

      <div className="panel" style={{ marginBottom: 12 }}>
        <h3 style={{ marginTop: 0 }}>Wie verändern sich Hunger, Energie und Happiness?</h3>
        <p>
          Diese drei Werte bleiben nicht einfach stehen, sondern verändern sich mit der Zeit.
        </p>
        <p>
          <b>Energie</b> regeneriert sich langsam von selbst. Pro Minute kommt ein wenig
          Energie zurück. Wenn du also geduldig bist, kann sich dein Pet auch ohne Items
          wieder erholen.
        </p>
        <p>
          <b>Hunger</b> steigt mit der Zeit an. Pro Stunde wird dein Pet hungriger. Wenn du
          dich länger nicht kümmerst, braucht es also irgendwann wieder etwas zu essen.
        </p>
        <p>
          <b>Happiness</b> sinkt ebenfalls im Laufe der Zeit. Außerdem kostet Training auch
          direkt Laune. Wer nur ackert und nie für Ausgleich sorgt, bekommt irgendwann ein
          missmutiges kleines Wesen mit der Stimmung eines Montagmorgens.
        </p>
      </div>

      <div className="panel" style={{ marginBottom: 12 }}>
        <h3 style={{ marginTop: 0 }}>Was mache ich, wenn ich keine Energie mehr habe?</h3>
        <p>
          Dann hast du im Grunde zwei Wege.
        </p>
        <p>
          Erstens kannst du <b>warten</b>. Energie regeneriert sich mit der Zeit ganz von
          allein. Das ist der einfache, ruhige Weg.
        </p>
        <p>
          Zweitens kannst du <b>Items</b> nutzen. Im Shop kannst du dir Futter oder Tränke
          kaufen. Manche Nahrungsmittel und besonders Potions geben deinem Pet direkt neue
          Energie. Das ist der schnellere Weg, kostet aber Coins.
        </p>
        <p>
          Ein guter Rhythmus ist meistens: Quests machen, Minigame spielen, Coins verdienen,
          im Shop Vorräte besorgen und das Pet immer wieder rechtzeitig versorgen.
        </p>
      </div>

      <div className="panel" style={{ marginBottom: 12 }}>
        <h3 style={{ marginTop: 0 }}>Empfohlener Start für neue Spieler</h3>
        <p>
          Lege zuerst auf der Profile-Seite deinen Username fest. Danach kannst du dein
          erstes Pet adoptieren.
        </p>
        <p>
          Wenn dein Pet da ist, schau ins Dashboard. Dort siehst du die wichtigsten Werte
          und deine aktiven Quests. Fang mit einfachen Quests an, probiere das Minigame aus
          und kaufe bei Bedarf Futter oder Tränke im Shop.
        </p>
        <p>
          Du musst nicht alles sofort verstehen. Der sinnvollste Einstieg ist: ein bisschen
          versorgen, ein bisschen questen, ein bisschen spielen. Der Rest ergibt sich fast
          von selbst.
        </p>
      </div>

      <div className="panel">
        <h3 style={{ marginTop: 0 }}>Login / Registrierung</h3>
        <p className="muted" style={{ marginTop: 0 }}>
          Wenn du noch nicht eingeloggt bist, findest du unten das Login-Feld.
        </p>
        <div id="auth-panel-anchor" />
      </div>
    </div>
  );
}