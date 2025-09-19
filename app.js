let historyPage = 0;
const pageSize = 5;
let tokenChart;

// 模拟用户历史记录
const userHistory = { transactions: [], groupStatus: [] };

// 切换页面
function switchPage(el){
  document.querySelectorAll('.navbar a').forEach(a=>a.classList.remove('active'));
  el.classList.add('active');
  loadPageContent(el.dataset.page);
}

// 切换暗/亮模式
function toggleTheme(){
  const body = document.body;
  body.classList.toggle('dark-mode');
  body.classList.toggle('light-mode');
}

// 折叠/展开卡片
function toggleCard(card){ card.classList.toggle('expanded'); }

// 下拉刷新逻辑
let startY = 0, isPulling = false;
const pageContent = document.getElementById('pageContent');
pageContent.addEventListener("touchstart",(e)=>{ if(pageContent.scrollTop===0){startY=e.touches[0].pageY;isPulling=true;} });
pageContent.addEventListener("touchmove",(e)=>{ if(!isPulling) return; if(e.touches[0].pageY-startY>50) document.getElementById('pullRefresh').classList.add('active'); });
pageContent.addEventListener("touchend",(e)=>{ 
  if(document.getElementById('pullRefresh').classList.contains('active')){
    const activePage = document.querySelector(".navbar a.active").dataset.page;
    loadPageContent(activePage);
    setTimeout(()=>document.getElementById('pullRefresh').classList.remove('active'),1000);
  }
  isPulling=false;
});

// 加载历史记录分页
function loadUserHistory(page=0){
  const start = page*pageSize;
  const end = start+pageSize;
  let html = `<div class="card collapsed"><div class="card-header" onclick="toggleCard(this.parentNode)">交易记录</div><div class="card-content"><ul>`;
  userHistory.transactions.slice(start,end).forEach(t=>{ html+=`<li>${t.time}-${t.type}:${t.amount}</li>`; });
  html+='</ul></div></div>';

  html += `<div class="card collapsed"><div class="card-header" onclick="toggleCard(this.parentNode)">拼团状态</div><div class="card-content"><ul>`;
  userHistory.groupStatus.slice(start,end).forEach(g=>{ html+=`<li>${g.name}:${g.status}</li>`; });
  html+='</ul></div></div>';

  if(end<userHistory.transactions.length || end<userHistory.groupStatus.length)
    html+=`<button class="btn" onclick="loadMoreHistory()">加载更多</button>`;
  return html;
}

function loadMoreHistory(){ historyPage++; const activePage = document.querySelector(".navbar a.active").dataset.page; loadPageContent(activePage,historyPage); }

// 钱包连接及 BSC 链检测
async function connectWallet(){
  if(!window.ethereum){ alert("未检测到钱包"); return; }
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  await provider.send("eth_requestAccounts",[]);
  const network = await provider.getNetwork();
  if(network.chainId!==56){ alert("请切换到BSC链"); return; }
  return provider;
}

// 获取余额
async function getWalletBalance(provider, account){
  const balance = await provider.getBalance(account);
  return ethers.utils.formatEther(balance) + ' BNB';
}

// Token 列表显示
async function loadTokenListReal(){
  const provider = await connectWallet();
  if(!provider) return "<p>未连接钱包</p>";
  const accounts = await provider.listAccounts();
  if(!accounts.length) return "<p>未连接钱包</p>";
  const account = accounts[0];
  const tokenAddresses = [
    { address:"0xe9e7cea3dedca5984780bafc599bd69add087d56",symbol:"BUSD",icon:"busd.png",decimals:18 },
    { address:"0x55d398326f99059ff775485246999027b3197955",symbol:"USDT",icon:"usdt.png",decimals:18 },
    { address:"0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82",symbol:"CAKE",icon:"cake.png",decimals:18 }
  ];
  let html="<h2>持有的 Token</h2><ul>";
  for(let token of tokenAddresses){
    const t = await getTokenBalance(provider,account,token.address,token.decimals);
    html+=`<li class="token-item"><img src="icons/${token.icon}" alt="${token.symbol}"><span>${t.symbol}: <span class="token-amount">${t.balance}</span></span><button class="btn" onclick="alert('兑换 ${t.symbol} 成功')">兑换</button></li>`;
  }
  html+="</ul>";
  return html;
}

// 示例获取 Token 余额
async function getTokenBalance(provider,account,address,decimals){
  const abi = ["function balanceOf(address) view returns (uint256)","function decimals() view returns (uint8)","function symbol() view returns (string)"];
  const contract = new ethers.Contract(address,abi,provider);
  const balance = await contract.balanceOf(account);
  return {symbol: await contract.symbol(), balance: Number(ethers.utils.formatUnits(balance,decimals))};
}

// 动态数字动画
function animateTokenAmount(element,newAmount){
  const oldAmount=parseFloat(element.innerText);
  const diff=newAmount-oldAmount;
  let step=diff/20,count=0;
  const interval=setInterval(()=>{
    count++; element.innerText=(oldAmount+step*count).toFixed(2);
    if(count>=20){ element.innerText=newAmount.toFixed(2); clearInterval(interval); element.classList.add("reward-jump"); setTimeout(()=>element.classList.remove("reward-jump"),600);}
  },30);
}

// 图表绘制
function renderTokenChart(tokenData){
  const ctx=document.getElementById('tokenChart').getContext('2d');
  const labels=tokenData.map(t=>t.symbol), data=tokenData.map(t=>t.balance);
  const backgroundColors=['#f8b400','#ffcc33','#f3a600'];
  if(tokenChart) tokenChart.destroy();
  tokenChart=new Chart(ctx,{type:'doughnut',data:{labels, datasets:[{data,backgroundColor:backgroundColors}]},options:{responsive:true,plugins:{legend:{position:'bottom'}}}});
}

function updateTokenChart(tokenData){
  if(!tokenChart){ renderTokenChart(tokenData); return; }
  tokenChart.data.datasets[0].data=tokenData.map(t=>t.balance);
  tokenChart.update({duration:800,easing:'easeOutQuad'});
}

// 粒子奖励效果
function rewardParticleEffect(container,rewardValue=10){
  const particleCount=Math.min(Math.max(Math.floor(rewardValue/2),10),30);
  for(let i=0;i<particleCount;i++){
    const particle=document.createElement('div'); particle.className='particle';
    particle.style.left=Math.random()*100+'%'; particle.style.top='0%';
    const hue=Math.floor(Math.random()*50+40);
    particle.style.backgroundColor=`hsl(${hue},100%,50%)`;
    particle.style.width=particle.style.height=Math.random()*6+4+'px';
    container.appendChild(particle);
    particle.animate([{transform:'translateY(0) scale(1)',opacity:1},{transform:`translateY(${Math.random()*50+50}px) scale(0)`,opacity:0}],{duration:800,easing:'ease-out'});
    setTimeout(()=>container.removeChild(particle),800);
  }
}

// 切换页面内容加载
async function loadPageContent(page,historyPageLocal=0){
  historyPage=historyPageLocal;
  let html="";
  if(page==='home'){
    html+=await loadTokenListReal();
    html+=`<div id="tokenChartContainer" class="card"><h2>持仓比例</h2><canvas id="tokenChart" width="300" height="200"></canvas></div>`;
    setTimeout(()=>updateHomeVisuals(),500);
  } else {
    html+=loadUserHistory(historyPage);
  }
  pageContent.innerHTML=html;
}

// 首页动态更新
function updateHomeVisuals(){
  const tokenData=[{symbol:'BUSD',balance:12.5},{symbol:'USDT',balance:50.3},{symbol:'CAKE',balance:7.8}];
  updateTokenChart(tokenData);
  rewardParticleEffect(pageContent,20);
}

// 初始化
loadPageContent('home');
