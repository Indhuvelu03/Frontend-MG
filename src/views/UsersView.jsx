import React from "react";
import { PlusIcon, TrashIcon, EditIcon, UsersIcon } from "../components/Icons";

export default function UsersView({ users=[], user, onAddUser, onEditUser, onDeleteUser, searchQuery="" }) {
  const isAdmin = user?.role === "ADMIN";
  const isDealer = user?.role === "DEALER";
  const canManage = isAdmin || isDealer;

  // When logged in as a Dealer Manager, only show Service Advisors (STAFF role)
  const displayUsers = isDealer ? users.filter(u => u.role === "STAFF") : users;

  const filtered = searchQuery
    ? displayUsers.filter(u => (u.name||"").toLowerCase().includes(searchQuery.toLowerCase()) || (u.email||"").toLowerCase().includes(searchQuery.toLowerCase()))
    : displayUsers;

  const roleColor = r => r==="ADMIN" ? { bg:"#F5F3FF", color:"#7C3AED", border:"#DDD6FE" } : r==="DEALER" ? { bg:"#EFF6FF", color:"#2563EB", border:"#BFDBFE" } : { bg:"#ECFDF5", color:"#059669", border:"#A7F3D0" };
  const roleLabel = r => r==="ADMIN" ? "Super Admin" : r==="DEALER" ? "Dealer Manager" : "Service Advisor";

  const staffCount = users.filter(u => u.role === "STAFF").length;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">{isDealer ? "Service Advisors & Branch Staff" : "Users & System Accounts"}</h1>
          <p className="page-subtitle">
            {isDealer ? "Manage service advisors for your dealership branch (create up to 3 advisors)" : "System accounts — manage staff, dealers, and admin users"}
            {searchQuery && <span className="search-hint"> · Filtering "{searchQuery}" — {filtered.length} result{filtered.length!==1?"s":""}</span>}
          </p>
        </div>
        {canManage && (
          <div className="page-actions">
            <button className="btn btn-primary" onClick={onAddUser} disabled={isDealer && staffCount >= 3}>
              <PlusIcon size={15}/> {isDealer ? "Add Service Advisor" : "Add User"}
            </button>
          </div>
        )}
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"1rem", marginBottom:"1.5rem" }}>
        {[
          { label: isDealer ? "Total Service Advisors" : "Total Users", value: displayUsers.length },
          { label: isDealer ? "Advisor Limit" : "Dealers", value: isDealer ? "3 Max" : users.filter(u=>u.role==="DEALER").length },
          { label: "Active App Users", value: displayUsers.filter(u=>u.isActive!==false).length },
        ].map(s => (
          <div key={s.label} style={{ background:"#fff", border:"1px solid #E4E4E7", borderRadius:"8px", padding:"1rem 1.25rem" }}>
            <div style={{ fontSize:"0.7rem", fontWeight:700, color:"#A1A1AA", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:"0.35rem" }}>{s.label}</div>
            <div style={{ fontSize:"1.75rem", fontWeight:800, color:"#18181B" }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div style={{ background:"#fff", border:"1px solid #E4E4E7", borderRadius:"8px", overflow:"hidden" }}>
        <div style={{ padding:"1rem 1.25rem", borderBottom:"1px solid #E4E4E7", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <span style={{ fontWeight:700, fontSize:"0.9rem" }}>{isDealer ? "Branch Service Advisors" : "Registered Users"} <span style={{ fontSize:"0.78rem", color:"#A1A1AA", fontWeight:400 }}>({filtered.length})</span></span>
        </div>

        {filtered.length === 0 ? (
          <div style={{ padding:"4rem 1.5rem", textAlign:"center" }}>
            <div style={{ display:"flex", justifyContent:"center", marginBottom:"1rem", color:"#A1A1AA" }}>
              <UsersIcon size={40} />
            </div>
            <h3 style={{ fontWeight:700, fontSize:"1rem", color:"#18181B", marginBottom:"0.5rem" }}>{searchQuery ? `No staff match "${searchQuery}"` : isDealer ? "No Service Advisors Created Yet" : "No Users Yet"}</h3>
            <p style={{ fontSize:"0.85rem", color:"#71717A", maxWidth:380, margin:"0 auto 1.5rem", lineHeight:1.6 }}>
              {isDealer ? "Add service advisors to help manage customer registrations, voice notes, and invoices." : "Create user accounts for dealers and staff members."}
            </p>
            {canManage && (
              <button className="btn btn-primary" onClick={onAddUser} disabled={isDealer && staffCount >= 3}>
                <PlusIcon size={15}/> {isDealer ? "Add First Service Advisor" : "Add First User"}
              </button>
            )}
          </div>
        ) : (
          <table className="custom-table">
            <thead>
              <tr><th>#</th><th>Name</th><th>Email</th><th>Phone</th><th>Role</th><th>Joined</th><th>Status</th>{canManage && <th>Action</th>}</tr>
            </thead>
            <tbody>
              {filtered.map((u, idx) => {
                const rc = roleColor(u.role);
                const isSelfOrDealer = u.role === "DEALER" || u.role === "ADMIN";
                const allowAction = isAdmin || (isDealer && u.role === "STAFF");

                return (
                  <tr key={u._id||u.id||idx}>
                    <td style={{ color:"#A1A1AA", fontSize:"0.75rem", width:36 }}>{idx+1}</td>
                    <td>
                      <div style={{ display:"flex", alignItems:"center", gap:"0.55rem" }}>
                        <div style={{ width:28, height:28, borderRadius:"6px", background: u.role==="ADMIN"?"#F5F3FF":u.role==="DEALER"?"#EFF6FF":"#ECFDF5", color: u.role==="ADMIN"?"#7C3AED":u.role==="DEALER"?"#2563EB":"#059669", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, fontSize:"0.72rem", flexShrink:0 }}>
                          {(u.name||"U")[0].toUpperCase()}
                        </div>
                        <span style={{ fontWeight:600, fontSize:"0.875rem", color:"#18181B" }}>{u.name||"—"}</span>
                      </div>
                    </td>
                    <td style={{ fontSize:"0.8rem", color:"#52525B" }}>{u.email||"—"}</td>
                    <td style={{ fontSize:"0.8rem", color:"#71717A" }}>{u.phone||u.mobile||"—"}</td>
                    <td>
                      <span style={{ fontSize:"0.68rem", fontWeight:700, background:rc.bg, color:rc.color, border:`1px solid ${rc.border}`, padding:"0.15rem 0.5rem", borderRadius:"4px" }}>
                        {roleLabel(u.role)}
                      </span>
                    </td>
                    <td style={{ fontSize:"0.78rem", color:"#A1A1AA" }}>{u.createdAt ? new Date(u.createdAt).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"}) : "—"}</td>
                    <td><span style={{ fontSize:"0.68rem", fontWeight:700, background:"#ECFDF5", color:"#059669", border:"1px solid #A7F3D0", padding:"0.15rem 0.5rem", borderRadius:"4px" }}>Active</span></td>
                    {canManage && (
                      <td>
                        {allowAction ? (
                          <div style={{ display:"flex", gap:"0.35rem" }}>
                            <button className="btn btn-secondary btn-sm" style={{ padding:"0.25rem 0.5rem", fontSize:"0.75rem" }} onClick={() => onEditUser&&onEditUser(u)} title="Edit user"><EditIcon size={12}/> Edit</button>
                            <button className="btn btn-secondary btn-sm" style={{ padding:"0.25rem 0.5rem", color:"#DC2626", borderColor:"#FECACA" }} onClick={() => onDeleteUser&&onDeleteUser(u._id||u.id)} title="Delete user"><TrashIcon size={12}/></button>
                          </div>
                        ) : (
                          <span style={{ fontSize: "0.75rem", color: "#A1A1AA", fontStyle: "italic" }}>Protected</span>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
