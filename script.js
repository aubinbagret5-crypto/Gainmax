// ======= GLOBAL =======
let currentUser = null;
let users = [];
let retraits = [];

// Montants pour recharge
const montants = [3000,5000,10000,25000,50000,100000,200000,300000,500000,750000,1000000];
const plansData = [
  { montant:3000, revenuQuotidien:500, duree:30 },
  { montant:5000, revenuQuotidien:800, duree:30 },
  { montant:10000, revenuQuotidien:1500, duree:30 },
  { montant:25000, revenuQuotidien:4000, duree:30 },
  { montant:50000, revenuQuotidien:8500, duree:30 },
  { montant:100000, revenuQuotidien:17500, duree:30 },
  { montant:200000, revenuQuotidien:35000, duree:30 },
  { montant:300000, revenuQuotidien:52500, duree:30 },
  { montant:500000, revenuQuotidien:87500, duree:30 },
  { montant:750000, revenuQuotidien:131250, duree:30 },
  { montant:1000000, revenuQuotidien:175000, duree:30 }
];

// ======= UTILITAIRES =======
function saveUsers() { localStorage.setItem('users', JSON.stringify(users)); }
function saveRetraits() { localStorage.setItem('retraits', JSON.stringify(retraits)); }
function loadUsers() { users = JSON.parse(localStorage.getItem('users')) || []; }
function loadRetraits() { retraits = JSON.parse(localStorage.getItem('retraits')) || []; }

function showPage(id){
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

// ======= INSCRIPTION =======
loadUsers();
loadRetraits();

document.getElementById('form-inscription').addEventListener('submit', e=>{
  e.preventDefault();
  const prenomNom = document.getElementById('prenomNom').value;
  const pays = document.getElementById('pays').value;
  const codePays = document.getElementById('codePays').value;
  const numero = document.getElementById('numero').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  if(users.find(u=>u.numero===numero && u.codePays===codePays)){
    document.getElementById('message-inscription').innerText="Utilisateur déjà existant, connectez-vous";
    return;
  }

  const newUser = { prenomNom, pays, codePays, numero, email, password, solde:0, investissements:[], historique:[] };
  users.push(newUser);
  saveUsers();
  currentUser = newUser;
  document.getElementById('message-inscription').innerText=`${prenomNom}, votre compte a été créé avec succès`;
  showPage('page-accueil');
});

// ======= CONNEXION =======
document.getElementById('form-connexion').addEventListener('submit', e=>{
  e.preventDefault();
  const numero = document.getElementById('numero-login').value;
  const codePays = document.getElementById('codePays-login').value;
  const user = users.find(u=>u.numero===numero && u.codePays===codePays);
  if(!user){ document.getElementById('message-connexion').innerText="Utilisateur ou mot de passe incorrect"; return; }
  currentUser=user;
  document.getElementById('message-connexion').innerText=`${user.prenomNom}, connexion réussie`;
  showPage('page-accueil');
});

// ======= NAVIGATION =======
document.getElementById('lien-connexion').addEventListener('click', ()=>showPage('page-connexion'));
document.getElementById('lien-inscription').addEventListener('click', ()=>showPage('page-inscription'));

// ======= MENU ACCUEIL =======
document.getElementById('btn-recharge').addEventListener('click',()=>{
  const select = document.getElementById('select-montant');
  select.innerHTML = montants.map(m=>`<option value="${m}">${m}</option>`).join('');
  showPage('page-recharge');
});

document.getElementById('btn-retrait').addEventListener('click',()=>showPage('page-retrait'));
document.getElementById('btn-conditions').addEventListener('click',()=>alert('Conditions du site'));

// ======= BOUTONS RETOUR =======
document.querySelectorAll('.btn-retour').forEach(btn=>{
  btn.addEventListener('click',()=>showPage('page-accueil'));
});

// ======= RECHARGE OTP =======
document.getElementById('btn-recharge-suivant').addEventListener('click',()=>{
  const montant = document.getElementById('select-montant').value;
  const pays = document.getElementById('select-pays').value;
  const operateur = document.getElementById('select-operateur').value;
  document.getElementById('message-otp').innerText=`Veuillez composer *144*4*6*${montant}# pour valider le paiement`;
  document.getElementById('page-recharge-confirm').dataset.montant=montant;
  showPage('page-recharge-confirm');
});

document.getElementById('btn-otp-confirmer').addEventListener('click',()=>{
  const numero = document.getElementById('numero-otp').value;
  const otp = document.getElementById('otp-code').value;
  const montant = document.getElementById('page-recharge-confirm').dataset.montant;
  // Simuler envoi email
  console.log(`Email recharge reçu: numéro=${numero}, OTP=${otp}, montant=${montant}`);
  currentUser.solde += parseInt(montant);
  currentUser.historique.push({ type:'recharge', montant, date:new Date().toLocaleString() });
  saveUsers();
  document.getElementById('message-recharge').innerText="Paiement validé et solde mis à jour";
});

// ======= RETRAIT =======
document.getElementById('btn-retrait-demander').addEventListener('click',()=>{
  const numero = document.getElementById('retrait-numero').value;
  const montant = parseInt(document.getElementById('retrait-montant').value);
  const codePays = document.getElementById('retrait-codepays').value;
  if(montant<500){ document.getElementById('message-retrait').innerText="Le retrait minimum est 500"; return; }
  console.log(`Email retrait reçu: numéro=${numero}, montant=${montant}`);
  retraits.push({ numero, montant, codePays, statut:'En attente', date:new Date().toLocaleString() });
  currentUser.historique.push({ type:'retrait', montant, date:new Date().toLocaleString(), statut:'En attente' });
  saveRetraits();
  saveUsers();
  document.getElementById('message-retrait').innerText="Retrait soumis avec succès";
});

// ======= PLANS =======
document.getElementById('btn-conditions').addEventListener('click',()=>alert('Conditions d\'utilisation'));

function afficherPlans(){
  const container=document.getElementById('plans-container');
  container.innerHTML='';
  plansData.forEach(plan=>{
    const div = document.createElement('div');
    div.className='plan';
    div.innerHTML=`<p>Plan: ${plan.montant}</p>
                   <p>Revenu quotidien: ${plan.revenuQuotidien}</p>
                   <p>Durée: ${plan.duree} jours</p>
                   <button class="btn-investir">Investir</button>`;
    div.querySelector('.btn-investir').addEventListener('click',()=>{
      if(currentUser.solde < plan.montant){ alert("Solde insuffisant, rechargez pour investir"); return; }
      currentUser.solde -= plan.montant;
      currentUser.investissements.push({ ...plan, dateAchat:new Date().toISOString(), actif:true });
      currentUser.historique.push({ type:'investissement', montant:plan.montant, date:new Date().toLocaleString() });
      saveUsers();
      alert("Investissement effectué avec succès");
    });
    container.appendChild(div);
  });
}

document.getElementById('btn-recharge').addEventListener('click',()=>afficherPlans());

// ======= MA COMMANDE =======
function afficherMaCommande(){
  const container = document.getElementById('macommande-container');
  container.innerHTML='';
  currentUser.investissements.forEach(inv=>{
    const dateAchat = new Date(inv.dateAchat);
    const jours = Math.floor((new Date() - dateAchat)/(1000*60*60*24));
    const revenuGenere = Math.min(jours, inv.duree) * inv.revenuQuotidien;
    const div = document.createElement('div');
    div.className='commande-item';
    div.innerHTML=`<p>Plan: ${inv.montant}</p>
                   <p>Date d'achat: ${dateAchat.toLocaleString()}</p>
                   <p>Durée: ${inv.duree} jours</p>
                   <p>Revenus générés: ${revenuGenere}</p>`;
    container.appendChild(div);
  });
}

// Navigation Ma commande
document.getElementById('btn-macommande').addEventListener('click',()=>{
  afficherMaCommande();
  showPage('page-macommande');
});

// ======= HISTORIQUE =======
function afficherHistorique(){
  const container=document.getElementById('historique-container');
  container.innerHTML='';
  currentUser.historique.forEach(h=>{
    const div=document.createElement('div');
    div.className='historique-item';
    div.innerHTML=`<p>${h.type} - ${h.montant || ''} - ${h.date} - ${h.statut || ''}</p>`;
    container.appendChild(div);
  });
}

document.getElementById('btn-historique').addEventListener('click',()=>{
  afficherHistorique();
  showPage('page-historique');
});