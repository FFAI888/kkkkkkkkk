const BSC_CHAIN_ID = "0x38"; // BSC 主网

async function connectWallet() {
  console.log("连接钱包按钮被点击"); // 调试输出
  if (!window.ethereum) {
    alert("请先安装 MetaMask!");
    return;
  }

  try {
    // 创建 ethers provider
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    
    // 请求用户授权账户访问
    const accounts = await provider.send("eth_requestAccounts", []);
    console.log("已连接账户:", accounts);

    // 获取链信息
    const network = await provider.getNetwork();
    console.log("当前链ID:", network.chainId);

    // 判断是否是BSC链
    if (network.chainId !== 56) {
      alert("请切换到 BSC 主网!");
      return;
    }

    // 更新页面状态
    document.getElementById("status").innerText = "已连接BSC链";

    // 跳转确认关系页面
    window.location.href = "relation.html";
  } catch (err) {
    console.error("连接失败:", err);
    alert("连接失败: " + err.message);
  }
}

// 确保 DOM 加载完成再绑定事件
document.addEventListener("DOMContentLoaded", () => {
  const connectButton = document.getElementById("connectButton");
  if (connectButton) {
    console.log("按钮事件已绑定");
    connectButton.addEventListener("click", connectWallet);
  } else {
    console.error("未找到 connectButton 按钮");
  }
});
