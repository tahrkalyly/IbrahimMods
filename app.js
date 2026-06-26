/* app.js */

// ===== Firebase Config =====
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
getDatabase,
ref,
onValue,
set,
update,
get,
child
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

const firebaseConfig = {
apiKey: "AIzaSyDWh6zX7Du55_qV0g9yMVqfvpLZP60Hg",
databaseURL: "https://ibrahim-store-e701d-default-rtdb.firebaseio.com",
projectId: "ibrahim-store-e701d",
storageBucket: "ibrahim-store-e701d.firebasestorage.app"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// ===== عناصر الصفحة =====
const appsContainer = document.getElementById("apps");
const template = document.getElementById("card");
const searchInput = document.getElementById("search");
const themeBtn = document.getElementById("themeBtn");

// ===== الوضع الليلي =====
if(localStorage.getItem("theme")==="light"){
document.body.classList.add("light");
}

themeBtn.onclick = () => {
document.body.classList.toggle("light");
localStorage.setItem("theme",
document.body.classList.contains("light")
? "light":"dark");
};

// ===== Offline =====
const offlineScreen = document.getElementById("offline-screen");

function checkOnline(){
if(navigator.onLine){
offlineScreen.style.display="none";
}else{
offlineScreen.style.display="flex";
}
}

window.addEventListener("online",checkOnline);
window.addEventListener("offline",checkOnline);
checkOnline();

// ===== تحميل التطبيقات =====
let appsData = {};

function loadApps(){
const appsRef = ref(db,"apps");

onValue(appsRef,(snapshot)=>{
appsContainer.innerHTML="";
appsData = snapshot.val() || {};

for(let id in appsData){
const app = appsData[id];
renderApp(id,app);
}
});
}

loadApps();

// ===== عرض تطبيق =====
function renderApp(id,app){

const node = template.content.cloneNode(true);

node.querySelector(".logo").src = app.logo;
node.querySelector(".name").textContent = app.name;
node.querySelector(".desc").textContent = app.description;

node.querySelector(".downloads").textContent = app.downloads || 0;

// التقييم
node.querySelector(".avg").textContent = app.ratingAvg || 0;
node.querySelector(".count").textContent = app.ratingCount || 0;

// تحميل
node.querySelector(".download").onclick = async () => {

window.open(app.url,"_blank");

// زيادة التحميلات
const appRef = ref(db,"apps/"+id);
await update(appRef,{
downloads:(app.downloads||0)+1
});
};

// التقييم
const stars = node.querySelectorAll(".rating button");

stars.forEach(btn=>{
btn.onclick = async () => {
const value = Number(btn.dataset.rate);

const userKey = "user_" + id;
const dbRef = ref(db);

const snapshot = await get(child(dbRef,"ratings/"+id+"/"+userKey));

if(snapshot.exists()){
alert("لقد قمت بالتقييم مسبقاً");
return;
}

// حفظ التقييم
await set(ref(db,"ratings/"+id+"/"+userKey),value);

// تحديث المتوسط
const ratingsSnap = await get(ref(db,"ratings/"+id));

let total = 0;
let count = 0;

ratingsSnap.forEach(r=>{
total += r.val();
count++;
});

const avg = (total/count).toFixed(1);

await update(ref(db,"apps/"+id),{
ratingAvg: avg,
ratingCount: count
});
};
});

// إضافة البطاقة
appsContainer.appendChild(node);
}

// ===== البحث =====
searchInput.addEventListener("input",()=>{
const value = searchInput.value.toLowerCase();

document.querySelectorAll(".app-card").forEach(card=>{
const name = card.querySelector(".name").textContent.toLowerCase();

card.style.display =
name.includes(value) ? "block":"none";
});
});

// ===== إرسال الطلب =====
document.getElementById("requestForm").addEventListener("submit",async(e)=>{
e.preventDefault();

const user = document.getElementById("user").value;
const details = document.getElementById("details").value;

const id = Date.now();

await set(ref(db,"requests/"+id),{
user,
details,
time: new Date().toISOString()
});

alert("تم إرسال الطلب بنجاح");

document.getElementById("requestForm").reset();
});