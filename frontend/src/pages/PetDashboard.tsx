import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { apiGet, apiPost } from "../lib/api";
import type { InventoryResolved, Pet, ResolvedInvItem } from "../lib/types";
import { Card, ProgressBar } from "../lib/ui";

export default function PetDashboard() {
  const { id } = useParams();
  const [pet, setPet] = useState<Pet | null>(null);
  const [inv, setInv] = useState<InventoryResolved | null>(null);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");

  async function load() {
    if (!id) return;
    const [petRes, invRes] = await Promise.all([
      apiGet<{ data: Pet }>(`/api/pets/${id}`),
      apiGet<{ data: InventoryResolved }>(`/api/pets/${id}/inventory`)
    ]);
    setPet(petRes.data);
    setInv(invRes.data);
  }

  useEffect(() => {
    load().catch(e => setErr(String(e.message || e)));
    // optional auto refresh every 10s
    const t = setInterval(() => {
      load().catch(() => {});
    }, 10000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const foods = useMemo(() => (inv?.items ?? []).filter(x => x.item?.type === "food"), [inv]);
  const toys = useMemo(() => (inv?.items ?? []).filter(x => x.item?.type === "toy"), [inv]);
  const books = useMemo(() => (inv?.items ?? []).filter(x => x.item?.type === "book"), [inv]);

  async function quickFeed(item: ResolvedInvItem) {
    if (!id) return;
    setErr(""); setMsg("");
    try {
      const res = await apiPost<{ data: { pet: Pet; inventory: InventoryResolved } }>(`/api/pets/${id}/feed`, {
        foodItemId: item.itemId
      });
      setPet(res.data.pet);
      setInv(res.data.inventory);
      setMsg(`Fed: ${item.item?.name ?? item.itemId}`);
    } catch (e: any) {
      setErr(e.message ?? String(e));
    }
  }

  async function quickPlay(item: ResolvedInvItem) {
    if (!id) return;
    setErr(""); setMsg("");
    try {
      const res = await apiPost<{ data: { pet: Pet; inventory: InventoryResolved } }>(`/api/pets/${id}/play`, {
        toyItemId: item.itemId
      });
      setPet(res.data.pet);
      setInv(res.data.inventory);
      setMsg(`Played: ${item.item?.name ?? item.itemId}`);
    } catch (e: any) {
      setErr(e.message ?? String(e));
    }
  }

  async function quickRead(item: ResolvedInvItem) {
    if (!id) return;
    setErr(""); setMsg("");
    try {
      const res = await apiPost<{ data: { pet: Pet; inventory: InventoryResolved } }>(`/api/pets/${id}/read`, {
        bookItemId: item.itemId
      });
      setPet(res.data.pet);
      setInv(res.data.inventory);
      setMsg(`Read: ${item.item?.name ?? item.itemId}`);
    } catch (e: any) {
      setErr(e.message ?? String(e));
    }
  }

  async function quickTrain(skill: "strength" | "agility" | "intelligence") {
    if (!id) return;
    setErr(""); setMsg("");
    try {
      const res = await apiPost<{ data: { pet: Pet } }>(`/api/pets/${id}/train`, { skill });
      setPet(res.data.pet);
      setMsg(`Trained: ${skill}`);
    } catch (e: any) {
      setErr(e.message ?? String(e));
    }
  }

  if (!id) return <p>Missing pet id</p>;

  return (
    <div>
      <h2>Pet Dashboard</h2>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
        <button onClick={() => load().catch(() => {})}>Refresh</button>
        <Link to="/inventory">Inventory</Link>
        <Link to="/shop">Shop</Link>
        <Link to="/quests">Quests</Link>
      </div>

      {err && <p style={{ color: "crimson" }}>{err}</p>}
      {msg && <p style={{ color: "green" }}>{msg}</p>}

      {!pet ? (
        <p>Loading...</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 12 }}>
          <Card title={`${pet.name} (${pet.species})`}>
            <p style={{ marginTop: 0 }}>
              Level <b>{pet.level}</b> | XP <b>{pet.xp}</b> | Coins <b>{pet.coins}</b>
            </p>
            <ProgressBar label="Hunger (lower is better)" value={pet.hunger} />
            <ProgressBar label="Happiness" value={pet.happiness} />
            <ProgressBar label="Energy" value={pet.energy} />

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginTop: 10 }}>
              <div style={{ border: "1px solid #eee", borderRadius: 12, padding: 10 }}>
                <div style={{ fontSize: 12, opacity: 0.7 }}>STR</div>
                <b style={{ fontSize: 18 }}>{pet.strength}</b>
              </div>
              <div style={{ border: "1px solid #eee", borderRadius: 12, padding: 10 }}>
                <div style={{ fontSize: 12, opacity: 0.7 }}>AGI</div>
                <b style={{ fontSize: 18 }}>{pet.agility}</b>
              </div>
              <div style={{ border: "1px solid #eee", borderRadius: 12, padding: 10 }}>
                <div style={{ fontSize: 12, opacity: 0.7 }}>INT</div>
                <b style={{ fontSize: 18 }}>{pet.intelligence}</b>
              </div>
            </div>
          </Card>

          <Card title="Quick Actions">
            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12 }}>
              <div>
                <b>Feed</b>
                <div style={{ marginTop: 6, display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {foods.slice(0, 3).map(f => (
                    <button key={f.itemId} onClick={() => quickFeed(f)}>
                      {f.item?.name ?? f.itemId} (×{f.qty})
                    </button>
                  ))}
                  <Link to="/feed" style={{ alignSelf: "center" }}>more…</Link>
                </div>
              </div>

              <div>
                <b>Play</b>
                <div style={{ marginTop: 6, display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {toys.slice(0, 3).map(t => (
                    <button key={t.itemId} onClick={() => quickPlay(t)}>
                      {t.item?.name ?? t.itemId} (×{t.qty})
                    </button>
                  ))}
                  <Link to="/play" style={{ alignSelf: "center" }}>more…</Link>
                </div>
              </div>

              <div>
                <b>Read</b>
                <div style={{ marginTop: 6, display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {books.slice(0, 3).map(b => (
                    <button key={b.itemId} onClick={() => quickRead(b)}>
                      {b.item?.name ?? b.itemId} (×{b.qty})
                    </button>
                  ))}
                  <Link to="/read" style={{ alignSelf: "center" }}>more…</Link>
                </div>
              </div>

              <div>
                <b>Train</b>
                <div style={{ marginTop: 6, display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <button onClick={() => quickTrain("strength")}>Strength</button>
                  <button onClick={() => quickTrain("agility")}>Agility</button>
                  <button onClick={() => quickTrain("intelligence")}>Intelligence</button>
                  <Link to="/train" style={{ alignSelf: "center" }}>details…</Link>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
