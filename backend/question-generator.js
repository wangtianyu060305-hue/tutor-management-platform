// 题库生成引擎 — 模板化自动生成数学/物理/化学计算题
// 每个模板 × count 变体 = 大量题目

// ======================== 工具函数 ========================

function rand(a, b) { return Math.floor(Math.random() * (b - a + 1)) + a; }
function randFloat(a, b, d = 1) { const v = Math.random() * (b - a) + a; return Math.round(v * Math.pow(10, d)) / Math.pow(10, d); }
function pick(arr) { return arr[rand(0, arr.length - 1)]; }
function fmtNum(n) { return n >= 0 ? String(n) : `(${n})`; }
function fracStr(a, b) { return `${a}/${b}`; }

// 批量生成，允许有限的重复（不同年级会用不同grade参数存储，所以没问题）
function bulkGen(gen, count) {
  const results = [];
  for (let i = 0; i < count; i++) {
    results.push(gen());
  }
  return results;
}

// ======================== 数学模板 ========================
// count 已按每年级至少800题目标调整

const MATH_TEMPLATES = [
  // ========== 小学一年级（目标~800+题） ==========
  { subject:'数学', grades:['一年级'], topic:'10以内加减法', type:'calculation', difficulty:1, count:80,
    gen() { const a=rand(1,9),b=rand(1,10-a); return {q:`${a} + ${b} = ？`, a:`${a+b}`, kp:'10以内加法'}; } },
  { subject:'数学', grades:['一年级'], topic:'10以内加减法', type:'calculation', difficulty:1, count:80,
    gen() { const a=rand(2,10),b=rand(1,a-1); return {q:`${a} - ${b} = ？`, a:`${a-b}`, kp:'10以内减法'}; } },
  { subject:'数学', grades:['一年级'], topic:'10以内加减法', type:'calculation', difficulty:1, count:80,
    gen() { const a=rand(1,5),b=rand(1,5); return Math.random()>0.5?{q:`${a} + ${b} = ？`, a:`${a+b}`, kp:'5以内加法'}:{q:`${a} - ${b < a ? b : a} = ？`, a:`${Math.abs(a-b)}`, kp:'5以内减法'}; } },
  { subject:'数学', grades:['一年级'], topic:'20以内加减法', type:'calculation', difficulty:2, count:80,
    gen() { const a=rand(8,19),b=rand(1,20-a); return {q:`${a} + ${b} = ？`, a:`${a+b}`, kp:'20以内进位加法'}; } },
  { subject:'数学', grades:['一年级'], topic:'20以内加减法', type:'calculation', difficulty:2, count:80,
    gen() { const a=rand(11,20),b=rand(1,a-10); return {q:`${a} - ${b} = ？`, a:`${a-b}`, kp:'20以内退位减法'}; } },
  { subject:'数学', grades:['一年级'], topic:'20以内加减法', type:'calculation', difficulty:2, count:80,
    gen() { const a=rand(8,17); return {q:`${a} + 3 = ？`, a:`${a+3}`, kp:'加3练习'}; } },
  { subject:'数学', grades:['一年级'], topic:'20以内加减法', type:'calculation', difficulty:2, count:60,
    gen() { const a=rand(4,20); return {q:`${a} - 3 = ？`, a:`${a-3}`, kp:'减3练习'}; } },
  { subject:'数学', grades:['一年级'], topic:'比较大小', type:'choice', difficulty:1, count:60,
    gen() { const a=rand(1,20),b=rand(1,20); const s=a>b?'>':a<b?'<':'='; return {q:`在○里填上">"、"<"或"="：${a} ○ ${b}`, a:s, kp:'数的大小比较'}; } },
  { subject:'数学', grades:['一年级'], topic:'认识图形', type:'fill', difficulty:1, count:40,
    gen() { const s=pick(['正方体','长方体','圆柱','球']); return {q:`${s}有什么特征？`, a:s==='正方体'?'6个相同的正方形面':s==='长方体'?'6个面，相对面相等':s==='圆柱'?'上下两个圆形底面和一个曲面':'一个曲面，可以滚动', kp:'立体图形认识'}; } },
  { subject:'数学', grades:['一年级'], topic:'应用题', type:'application', difficulty:2, count:100,
    gen() { const a=rand(2,18),b=rand(1,15),op=pick(['加','减']); return op==='加'?{q:`树上有${a}只小鸟，又飞来${b}只，现在一共有多少只？`, a:`${a+b}只`, kp:'加法应用题'}:{q:`停车场有${a}辆车，开走了${Math.min(b,a-1)}辆，还剩多少辆？`, a:`${a-Math.min(b,a-1)}辆`, kp:'减法应用题'}; } },
  { subject:'数学', grades:['一年级'], topic:'规律找数', type:'fill', difficulty:2, count:50,
    gen() { const a=rand(1,5),d=rand(1,3); return {q:`找规律填数：${a}、${a+d}、${a+2*d}、？、${a+4*d}`, a:`${a+3*d}`, kp:'等差数列'}; } },

  // ========== 小学二年级（目标~800+题） ==========
  { subject:'数学', grades:['二年级'], topic:'表内乘法', type:'calculation', difficulty:1, count:100,
    gen() { const a=rand(1,9),b=rand(1,9); return {q:`${a} × ${b} = ？`, a:`${a*b}`, kp:`乘法口诀`}; } },
  { subject:'数学', grades:['二年级'], topic:'表内除法', type:'calculation', difficulty:2, count:80,
    gen() { const b=rand(1,9),c=rand(1,9); return {q:`${b*c} ÷ ${b} = ？`, a:`${c}`, kp:'表内除法'}; } },
  { subject:'数学', grades:['二年级'], topic:'100以内加减法', type:'calculation', difficulty:2, count:100,
    gen() { const a=rand(20,98),b=rand(10,99); return Math.random()>0.5?{q:`竖式计算：${a} + ${b} = ？`, a:`${a+b}`, kp:'两位数加法'}:{q:`竖式计算：${a} - ${b} = ？`, a:`${a-b}`, kp:'两位数减法'}; } },
  { subject:'数学', grades:['二年级'], topic:'混合运算', type:'calculation', difficulty:3, count:80,
    gen() { const a=rand(2,9),b=rand(2,9),c=rand(1,9); return {q:`${a} + ${b} × ${c} = ？（先算乘法）`, a:`${a+b*c}`, kp:'乘加混合'}; } },
  { subject:'数学', grades:['二年级'], topic:'混合运算', type:'calculation', difficulty:3, count:60,
    gen() { const a=rand(2,9),b=rand(2,9),c=rand(1,a*b-1); return {q:`${a*b} - ${c} = ？`, a:`${a*b-c}`, kp:'乘减混合'}; } },
  { subject:'数学', grades:['二年级'], topic:'长度单位', type:'fill', difficulty:2, count:50,
    gen() { const cm=rand(100,300); return {q:`${cm}厘米 = ？米？厘米`, a:`${Math.floor(cm/100)}米${cm%100}厘米`, kp:'长度换算'}; } },
  { subject:'数学', grades:['二年级'], topic:'认识时间', type:'fill', difficulty:2, count:50,
    gen() { const h=rand(1,12),m=pick([0,5,10,15,20,25,30,35,40,45,50,55]); return {q:`现在的时间是 ${h}:${String(m).padStart(2,'0')}，过一刻钟（15分钟）是几点几分？`, a:m+15<60?`${h}:${String(m+15).padStart(2,'0')}`:`${h===12?1:h+1}:${String(m+15-60).padStart(2,'0')}`, kp:'时间计算'}; } },
  { subject:'数学', grades:['二年级'], topic:'应用题', type:'application', difficulty:3, count:100,
    gen() { const a=rand(2,9),b=rand(2,9); return pick(['乘','除'])==='乘'?{q:`每组有${a}人，共${b}组，一共有多少人？`, a:`${a*b}人`, kp:'乘法应用'}:{q:`${a*b}个苹果，平均分给${a}个小朋友，每人几个？`, a:`${b}个`, kp:'除法应用'}; } },
  { subject:'数学', grades:['二年级'], topic:'认识角', type:'choice', difficulty:2, count:40,
    gen() { const deg=rand(10,170); const t=deg<90?'锐角':deg===90?'直角':'钝角'; return {q:`一个角是${deg}°，它是？A.锐角 B.直角 C.钝角`, a:`${deg<90?'A':deg===90?'B':'C'}（${t}）`, kp:'角的分类'}; } },
  { subject:'数学', grades:['二年级'], topic:'选择题', type:'choice', difficulty:2, count:60,
    gen() { const a=rand(10,50),b=rand(10,50); return {q:`${a}+${b}的结果是多少？A.${a+b-1} B.${a+b} C.${a+b+1} D.${a+b-2}`, a:`B`, kp:'加法验算'}; } },

  // ========== 小学三年级（目标~800+题） ==========
  { subject:'数学', grades:['三年级'], topic:'万以内加减', type:'calculation', difficulty:2, count:80,
    gen() { const a=rand(100,9999),b=rand(100,9999); return Math.random()>0.5?{q:`${a} + ${b} = ？`, a:`${a+b}`, kp:'万以内加法'}:{q:`${a} - ${b} = ？`, a:`${a-b}`, kp:'万以内减法'}; } },
  { subject:'数学', grades:['三年级'], topic:'多位数乘一位数', type:'calculation', difficulty:2, count:80,
    gen() { const a=rand(10,999),b=rand(2,9); return {q:`${a} × ${b} = ？`, a:`${a*b}`, kp:'多位数乘一位数'}; } },
  { subject:'数学', grades:['三年级'], topic:'多位数乘一位数', type:'calculation', difficulty:3, count:60,
    gen() { const a=rand(100,999),b=rand(3,9); return {q:`${a} × ${b} = ？`, a:`${a*b}`, kp:'三位数乘一位数'}; } },
  { subject:'数学', grades:['三年级'], topic:'除法', type:'calculation', difficulty:3, count:80,
    gen() { const b=rand(2,9),c=rand(10,999); return {q:`${b*c} ÷ ${b} = ？`, a:`${c}`, kp:'除数一位数除法'}; } },
  { subject:'数学', grades:['三年级'], topic:'分数初步', type:'fill', difficulty:2, count:60,
    gen() { const d=pick([2,3,4,5,6,8]),n=rand(1,d-1); return {q:`阴影部分占整体的几分之几？图中显示了${d}等份中的${n}份。`, a:fracStr(n,d), kp:'分数的认识'}; } },
  { subject:'数学', grades:['三年级'], topic:'分数初步', type:'calculation', difficulty:3, count:60,
    gen() { const d=pick([2,4,8]),n1=rand(1,d-1),n2=rand(1,d-n1); return {q:`${fracStr(n1,d)} + ${fracStr(n2,d)} = ？（同分母分数加法）`, a:fracStr(n1+n2,d), kp:'同分母分数加法'}; } },
  { subject:'数学', grades:['三年级'], topic:'周长', type:'calculation', difficulty:3, count:80,
    gen() { const w=rand(3,30),h=rand(3,30); return {q:`长方形长${w}cm，宽${h}cm，周长=？cm`, a:`${2*(w+h)}cm`, kp:'长方形周长'}; } },
  { subject:'数学', grades:['三年级'], topic:'面积', type:'calculation', difficulty:3, count:60,
    gen() { const w=rand(3,20),h=rand(3,20); return {q:`长方形长${w}cm，宽${h}cm，面积=？cm²`, a:`${w*h}cm²`, kp:'长方形面积'}; } },
  { subject:'数学', grades:['三年级'], topic:'面积', type:'calculation', difficulty:3, count:50,
    gen() { const s=rand(3,15); return {q:`正方形边长${s}cm，面积=？cm²`, a:`${s*s}cm²`, kp:'正方形面积'}; } },
  { subject:'数学', grades:['三年级'], topic:'小数初步', type:'calculation', difficulty:2, count:60,
    gen() { const a=randFloat(1,99,1),b=randFloat(0.1,99.9,1); return {q:`${a} + ${b} = ？`, a:`${Math.round((a+b)*10)/10}`, kp:'小数加法'}; } },
  { subject:'数学', grades:['三年级'], topic:'时分秒', type:'fill', difficulty:2, count:50,
    gen() { const m=rand(65,300); return {q:`${m}分钟 = ？小时？分钟`, a:`${Math.floor(m/60)}小时${m%60}分钟`, kp:'时间换算'}; } },
  { subject:'数学', grades:['三年级'], topic:'应用题', type:'application', difficulty:3, count:100,
    gen() { const p=rand(5,50),n=rand(2,20); return {q:`每个笔记本${p}元，买${n}本需要多少钱？`, a:`${p*n}元`, kp:'乘法应用'}; } },

  // ========== 小学四年级（目标~800+题） ==========
  { subject:'数学', grades:['四年级'], topic:'大数读写', type:'fill', difficulty:2, count:60,
    gen() { const d=[]; for(let i=0;i<6+rand(0,2);i++)d.push(rand(0,9)); const n=parseInt(d.join('')); return {q:`读出：${n.toLocaleString()}`, a:`读作${readChineseNum(n)}`, kp:'亿以内数的读法'}; } },
  { subject:'数学', grades:['四年级'], topic:'公顷平方千米', type:'fill', difficulty:2, count:50,
    gen() { const ha=rand(1,5000); return {q:`${ha}公顷 = ？平方千米`, a:`${ha/100}平方千米`, kp:'公顷与平方千米'}; } },
  { subject:'数学', grades:['四年级'], topic:'公顷平方千米', type:'fill', difficulty:2, count:50,
    gen() { const m2=rand(10000,5000000); return {q:`${m2}平方米 = ？公顷`, a:`${m2/10000}公顷`, kp:'平方米与公顷'}; } },
  { subject:'数学', grades:['四年级'], topic:'角的度量', type:'calculation', difficulty:3, count:60,
    gen() { const deg=rand(5,175); const t=deg<90?'锐角':deg===90?'直角':deg<180?'钝角':'平角'; return {q:`${deg}°是什么角？`, a:t, kp:'角的分类'}; } },
  { subject:'数学', grades:['四年级'], topic:'角的度量', type:'calculation', difficulty:3, count:50,
    gen() { const a=rand(30,80),b=180-a; return {q:`已知∠1=${a}°，∠1和∠2组成平角，∠2=？`, a:`${b}°`, kp:'平角=180°'}; } },
  { subject:'数学', grades:['四年级'], topic:'三位数乘两位数', type:'calculation', difficulty:3, count:100,
    gen() { const a=rand(100,999),b=rand(10,99); return {q:`${a} × ${b} = ？`, a:`${a*b}`, kp:'三位数乘两位数'}; } },
  { subject:'数学', grades:['四年级'], topic:'除数是两位数', type:'calculation', difficulty:4, count:80,
    gen() { const b=rand(11,99),c=rand(10,999); return {q:`${b*c} ÷ ${b} = ？`, a:`${c}`, kp:'除数是两位数'}; } },
  { subject:'数学', grades:['四年级'], topic:'平行四边形和梯形', type:'fill', difficulty:2, count:50,
    gen() { const s=pick(['平行四边形','梯形','等腰梯形']); return {q:`${s}的特征？`, a:s==='平行四边形'?'两组对边分别平行且相等':s==='梯形'?'只有一组对边平行':'两腰相等', kp:s}; } },
  { subject:'数学', grades:['四年级'], topic:'统计', type:'application', difficulty:2, count:40,
    gen() { const items=['语文','数学','英语','科学']; const vals=items.map(()=>rand(70,100)); const max=Math.max(...vals); const sub=items[vals.indexOf(max)]; return {q:`成绩：${items.map((s,i)=>s+vals[i]).join(',')}。最高的科目？`, a:`${sub}(${max}分)`, kp:'条形统计图'}; } },
  { subject:'数学', grades:['四年级'], topic:'速度时间路程', type:'calculation', difficulty:3, count:60,
    gen() { const s=rand(100,800),t=rand(1,8); return {q:`汽车${t}小时行${s*t}千米，速度=？km/h`, a:`${s}km/h`, kp:'速度=路程÷时间'}; } },
  { subject:'数学', grades:['四年级'], topic:'应用题', type:'application', difficulty:3, count:100,
    gen() { const n=rand(10,100),m=rand(10,500); return {q:`每箱装${n}个苹果，${m}个苹果能装满几箱？还剩几个？`, a:`${Math.floor(m/n)}箱，剩${m%n}个`, kp:'除法应用'}; } },

  // ========== 小学五年级（目标~800+题） ==========
  { subject:'数学', grades:['五年级'], topic:'小数乘法', type:'calculation', difficulty:3, count:80,
    gen() { const a=randFloat(0.1,99,1),b=randFloat(0.1,9.9,1); return {q:`${a} × ${b} = ？`, a:`${Math.round(a*b*100)/100}`, kp:'小数乘法'}; } },
  { subject:'数学', grades:['五年级'], topic:'小数乘法', type:'calculation', difficulty:3, count:60,
    gen() { const a=randFloat(1,99,1),b=rand(10,100); return {q:`${a} × ${b} = ？`, a:`${Math.round(a*b*10)/10}`, kp:'小数乘整数'}; } },
  { subject:'数学', grades:['五年级'], topic:'小数除法', type:'calculation', difficulty:4, count:80,
    gen() { const b=randFloat(0.2,9.9,1),c=randFloat(1,99,1); return {q:`${Math.round(b*c*100)/100} ÷ ${b} = ？`, a:`${c}`, kp:'小数除法'}; } },
  { subject:'数学', grades:['五年级'], topic:'小数除法', type:'calculation', difficulty:4, count:60,
    gen() { const a=randFloat(10,99,1),b=rand(2,15); return {q:`${a} ÷ ${b} ≈ ？（保留一位小数）`, a:`${Math.round(a/b*10)/10}`, kp:'小数除法近似值'}; } },
  { subject:'数学', grades:['五年级'], topic:'简易方程', type:'calculation', difficulty:3, count:100,
    gen() { const a=rand(1,20),x=rand(-10,20),b=rand(-50,50); return {q:`解方程：${a}x + ${b-a*x} = ${b}`, a:`x = ${x}`, kp:'一元一次方程'}; } },
  { subject:'数学', grades:['五年级'], topic:'多边形面积', type:'calculation', difficulty:3, count:70,
    gen() { const b=rand(3,20),h=rand(3,20); return {q:`三角形底${b}cm，高${h}cm，面积=？cm²`, a:`${b*h/2}cm²`, kp:'三角形面积'}; } },
  { subject:'数学', grades:['五年级'], topic:'多边形面积', type:'calculation', difficulty:3, count:70,
    gen() { const a=rand(3,15),b=rand(3,15),h=rand(2,20); return {q:`梯形上底${a}cm下底${b}cm高${h}cm，面积=？cm²`, a:`${(a+b)*h/2}cm²`, kp:'梯形面积'}; } },
  { subject:'数学', grades:['五年级'], topic:'因数与倍数', type:'fill', difficulty:3, count:60,
    gen() { const n=rand(12,100); return {q:`${n}的因数有哪些？`, a:factors(n).join('、'), kp:'因数'}; } },
  { subject:'数学', grades:['五年级'], topic:'分数加减法', type:'calculation', difficulty:3, count:80,
    gen() { const d1=pick([2,3,4,5,6,8,9,10,12]),n1=rand(1,d1-1),d2=pick([2,3,4,5,6,8,9,10,12]),n2=rand(1,d2-1); const l=lcm(d1,d2); const num=n1*l/d1+n2*l/d2; const g=gcd(num,l); return {q:`${fracStr(n1,d1)} + ${fracStr(n2,d2)} = ？`, a:fracStr(num/g,l/g), kp:'异分母加法'}; } },
  { subject:'数学', grades:['五年级'], topic:'正方体长方体', type:'calculation', difficulty:3, count:50,
    gen() { const l=rand(2,15),w=rand(2,10),h=rand(2,10); return {q:`长方体长${l}宽${w}高${h}，表面积=？`, a:`${2*(l*w+l*h+w*h)}`, kp:'长方体表面积'}; } },

  // ========== 小学六年级（目标~800+题） ==========
  { subject:'数学', grades:['六年级'], topic:'分数乘法', type:'calculation', difficulty:3, count:80,
    gen() { const n1=rand(1,9),d1=rand(2,10),n2=rand(1,9),d2=rand(2,10); const g=gcd(n1*n2,d1*d2); return {q:`${fracStr(n1,d1)} × ${fracStr(n2,d2)} = ？`, a:fracStr(n1*n2/g,d1*d2/g), kp:'分数乘法'}; } },
  { subject:'数学', grades:['六年级'], topic:'分数除法', type:'calculation', difficulty:4, count:80,
    gen() { const n1=rand(1,9),d1=rand(2,10),n2=rand(1,9),d2=rand(2,10); const g=gcd(n1*d2,d1*n2); return {q:`${fracStr(n1,d1)} ÷ ${fracStr(n2,d2)} = ？`, a:fracStr(n1*d2/g,d1*n2/g), kp:'分数除法'}; } },
  { subject:'数学', grades:['六年级'], topic:'比和比例', type:'calculation', difficulty:3, count:60,
    gen() { const a=rand(2,20),b=rand(2,20); const g=gcd(a,b); return {q:`化简：${a}:${b}`, a:`${a/g}:${b/g}`, kp:'化简比'}; } },
  { subject:'数学', grades:['六年级'], topic:'比和比例', type:'calculation', difficulty:3, count:50,
    gen() { const a=rand(2,10),b=rand(2,10),c=rand(2,10); return {q:`解比例：${a}:${b}=${c}:x`, a:`x=${b*c/a}`, kp:'解比例'}; } },
  { subject:'数学', grades:['六年级'], topic:'圆', type:'calculation', difficulty:3, count:80,
    gen() { const r=rand(2,30); return {q:`半径${r}cm的圆，周长=？cm（π≈3.14）`, a:`${Math.round(2*3.14*r*100)/100}cm`, kp:'圆周长'}; } },
  { subject:'数学', grades:['六年级'], topic:'圆', type:'calculation', difficulty:3, count:80,
    gen() { const r=rand(2,30); return {q:`半径${r}cm的圆，面积=？cm²（π≈3.14）`, a:`${Math.round(3.14*r*r*100)/100}cm²`, kp:'圆面积'}; } },
  { subject:'数学', grades:['六年级'], topic:'百分数', type:'application', difficulty:3, count:60,
    gen() { const p=rand(50,500),d=rand(5,9); return {q:`原价${p}元，打${d}折，现价=？元`, a:`${p*d/10}元`, kp:'折扣'}; } },
  { subject:'数学', grades:['六年级'], topic:'百分数', type:'application', difficulty:3, count:50,
    gen() { const a=rand(100,500),b=rand(100,600); return {q:`上月${a}元，本月${b}元，增加/减少了百分之几？`, a:b>a?`增加了${Math.round((b-a)/a*100)}%`:`减少了${Math.round((a-b)/a*100)}%`, kp:'增减百分比'}; } },
  { subject:'数学', grades:['六年级'], topic:'圆柱圆锥', type:'calculation', difficulty:4, count:80,
    gen() { const r=rand(2,15),h=rand(3,20); return {q:`圆柱半径${r}cm高${h}cm，体积=？cm³（π≈3.14）`, a:`${Math.round(3.14*r*r*h*100)/100}cm³`, kp:'圆柱体积'}; } },
  { subject:'数学', grades:['六年级'], topic:'圆柱圆锥', type:'calculation', difficulty:4, count:60,
    gen() { const r=rand(2,15),h=rand(3,20); return {q:`圆锥半径${r}cm高${h}cm，体积=？cm³（π≈3.14）`, a:`${Math.round(3.14*r*r*h/3*100)/100}cm³`, kp:'圆锥体积'}; } },
  { subject:'数学', grades:['六年级'], topic:'负数', type:'calculation', difficulty:2, count:60,
    gen() { const a=rand(-20,20),b=rand(-20,20); return {q:`${fmtNum(a)} + ${fmtNum(b)} = ？`, a:`${a+b}`, kp:'负数运算'}; } },

  // ========== 初一 ==========
  { subject:'数学', grades:['初一'], topic:'有理数运算', type:'calculation', difficulty:3, count:80,
    gen() { const a=rand(-20,20),b=rand(-20,20),c=rand(-10,10); return {q:`${fmtNum(a)} × ${fmtNum(b)} + ${fmtNum(c)} = ？`, a:`${a*b+c}`, kp:'有理数混合'}; } },
  { subject:'数学', grades:['初一'], topic:'有理数运算', type:'calculation', difficulty:3, count:80,
    gen() { const a=rand(-15,15),b=rand(-15,15); return {q:`|${fmtNum(a)}| + |${fmtNum(b)}| = ？`, a:`${Math.abs(a)+Math.abs(b)}`, kp:'绝对值'}; } },
  { subject:'数学', grades:['初一'], topic:'有理数运算', type:'calculation', difficulty:3, count:80,
    gen() { const a=rand(-10,10),b=rand(-10,10); return {q:`${fmtNum(a)} - ${fmtNum(b)} = ？`, a:`${a-b}`, kp:'有理数减法'}; } },
  { subject:'数学', grades:['初一'], topic:'整式加减', type:'calculation', difficulty:3, count:80,
    gen() { const a=rand(1,9),b=rand(-9,9),c=rand(1,9),d=rand(-9,9); return {q:`化简：(${a}x${b>=0?'+'+b:b}) + (${c}x${d>=0?'+'+d:d})`, a:`${a+c}x${b+d>=0?'+':''}${b+d}`, kp:'合并同类项'}; } },
  { subject:'数学', grades:['初一'], topic:'一元一次方程', type:'calculation', difficulty:3, count:100,
    gen() { const a=rand(1,15)*(Math.random()>0.5?1:-1),x=rand(-20,20),b=a*x+rand(-50,50); return {q:`解方程：${a}x${b-a*x>=0?'+':''}${b-a*x}=${b}`, a:`x=${x}`, kp:'一元一次方程'}; } },
  { subject:'数学', grades:['初一'], topic:'二元一次方程组', type:'calculation', difficulty:4, count:80,
    gen() { const x=rand(-10,10),y=rand(-10,10); const a1=rand(1,6),b1=rand(-5,5),a2=rand(1,6),b2=rand(-5,5); return {q:`解方程组：${a1}x${b1>=0?'+'+b1:b1}y=${a1*x+b1*y}，${a2}x${b2>=0?'+'+b2:b2}y=${a2*x+b2*y}`, a:`x=${x},y=${y}`, kp:'方程组'}; } },
  { subject:'数学', grades:['初一'], topic:'不等式', type:'calculation', difficulty:4, count:60,
    gen() { const a=rand(1,9),b=rand(-20,20),x=rand(-10,10); return {q:`解不等式：${a}x+${b}>${a*x+b+rand(1,10)}`, a:`x>${x+1}`, kp:'不等式'}; } },
  { subject:'数学', grades:['初一'], topic:'几何基础', type:'calculation', difficulty:2, count:60,
    gen() { const a=rand(2,15),b=rand(1,a-1); return {q:`线段AB=${a}cm，C在AB上，AC=${b}cm，BC=？`, a:`${a-b}cm`, kp:'线段的和差'}; } },
  { subject:'数学', grades:['初一'], topic:'几何基础', type:'calculation', difficulty:3, count:50,
    gen() { const a=rand(30,80),b=rand(30,120-a); return {q:`∠A=${a}°∠B=${b}°，∠C=？（三角形内角和）`, a:`${180-a-b}°`, kp:'三角形内角和'}; } },

  // ========== 初二 ==========
  { subject:'数学', grades:['初二'], topic:'三角形', type:'calculation', difficulty:4, count:60,
    gen() { const a=rand(30,80),b=rand(30,120-a); return {q:`三角形两个内角${a}°和${b}°，第三角=？°`, a:`${180-a-b}°`, kp:'内角和'}; } },
  { subject:'数学', grades:['初二'], topic:'全等三角形', type:'proof', difficulty:4, count:50,
    gen() { const m=pick(['SSS','SAS','ASA','AAS','HL']); return {q:`写出${m}的判定条件。`, a:m==='SSS'?'三边对应相等':m==='SAS'?'两边及夹角对应相等':m==='ASA'?'两角及夹边对应相等':m==='AAS'?'两角及一角的对边对应相等':'斜边和直角边对应相等', kp:`${m}判定`}; } },
  { subject:'数学', grades:['初二'], topic:'勾股定理', type:'calculation', difficulty:4, count:100,
    gen() { const a=rand(3,20),b=rand(3,20); return {q:`直角三角形直角边${a}和${b}，斜边=？（精确0.01）`, a:`${Math.round(Math.sqrt(a*a+b*b)*100)/100}`, kp:'勾股定理'}; } },
  { subject:'数学', grades:['初二'], topic:'勾股定理', type:'calculation', difficulty:4, count:60,
    gen() { const c=rand(5,25),a=rand(3,c-1); return {q:`斜边${c}，一直角边${a}，另一直角边=？`, a:`${Math.round(Math.sqrt(c*c-a*a)*100)/100}`, kp:'勾股定理逆用'}; } },
  { subject:'数学', grades:['初二'], topic:'一次函数', type:'calculation', difficulty:4, count:80,
    gen() { const k=rand(-5,5)||1,b=rand(-10,10),x=rand(1,5); return {q:`y=${k}x${b>=0?'+'+b:b}，x=${x}时y=？`, a:`${k*x+b}`, kp:'一次函数'}; } },
  { subject:'数学', grades:['初二'], topic:'一次函数', type:'calculation', difficulty:4, count:60,
    gen() { const k=rand(-3,3)||1,b=rand(-5,5); return {q:`y=${k}x${b>=0?'+'+b:b}与y轴交点？`, a:`(0,${b})`, kp:'y轴截距'}; } },
  { subject:'数学', grades:['初二'], topic:'因式分解', type:'calculation', difficulty:4, count:80,
    gen() { const a=rand(1,5),b=rand(1,10); return {q:`因式分解：${a*a}x²+${2*a*b}x+${b*b}`, a:`(${a}x+${b})²`, kp:'完全平方'}; } },
  { subject:'数学', grades:['初二'], topic:'因式分解', type:'calculation', difficulty:4, count:60,
    gen() { const a=rand(1,9),b=rand(1,9); return {q:`因式分解：${a*a}x²-${b*b}`, a:`(${a}x+${b})(${a}x-${b})`, kp:'平方差'}; } },
  { subject:'数学', grades:['初二'], topic:'分式', type:'calculation', difficulty:4, count:70,
    gen() { const a=rand(1,9),b=rand(2,10); return {q:`化简：${a}x²y/(${a*b}xy²)`, a:`x/(${b}y)`, kp:'分式化简'}; } },
  { subject:'数学', grades:['初二'], topic:'分式方程', type:'calculation', difficulty:4, count:60,
    gen() { const x=rand(2,10),a=rand(1,5); return {q:`解分式方程：${a*x}/x + 1/x = ${a}+1/x`, a:`x=${x}`, kp:'分式方程'}; } },

  // ========== 初三 ==========
  { subject:'数学', grades:['初三'], topic:'一元二次方程', type:'calculation', difficulty:4, count:100,
    gen() { const x1=rand(-10,10),x2=rand(-10,10); const a=rand(1,3),b=-a*(x1+x2),c=a*x1*x2; return {q:`解方程：${a}x²${b>=0?'+'+b:b}x${c>=0?'+'+c:c}=0`, a:`x₁=${x1},x₂=${x2}`, kp:'一元二次'}; } },
  { subject:'数学', grades:['初三'], topic:'一元二次方程', type:'calculation', difficulty:5, count:80,
    gen() { const a=rand(1,3),b=rand(-10,10),c=rand(-20,20); const d=b*b-4*a*c; const t=d>0?'两个不等实根':d===0?'一个重根':'无实数根'; return {q:`${a}x²${b>=0?'+'+b:b}x${c>=0?'+'+c:c}=0 根的情况？`, a:`判别式=${d}，${t}`, kp:'判别式'}; } },
  { subject:'数学', grades:['初三'], topic:'二次函数', type:'calculation', difficulty:5, count:80,
    gen() { const a=rand(-3,3)||1,h=rand(-5,5),k=rand(-10,10); return {q:`y=${a}(x${h>=0?'-'+h:'+'+(-h)})²${k>=0?'+'+k:k}的顶点坐标？`, a:`(${h},${k})`, kp:'顶点式'}; } },
  { subject:'数学', grades:['初三'], topic:'二次函数', type:'calculation', difficulty:5, count:60,
    gen() { const a=rand(-3,-1),h=rand(-5,5),k=rand(-10,10); return {q:`y=${a}(x${h>=0?'-'+h:'+'+(-h)})²${k>=0?'+'+k:k}的最大值？`, a:`${k}（a=${a}<0开口向下）`, kp:'二次函数最值'}; } },
  { subject:'数学', grades:['初三'], topic:'圆', type:'calculation', difficulty:4, count:80,
    gen() { const r=rand(3,20),n=rand(30,270); return {q:`半径${r}cm圆心角${n}°，弧长=？（π≈3.14）`, a:`${Math.round(2*3.14*r*n/360*100)/100}cm`, kp:'弧长'}; } },
  { subject:'数学', grades:['初三'], topic:'圆', type:'calculation', difficulty:4, count:60,
    gen() { const r=rand(3,20),n=rand(30,270); return {q:`半径${r}cm圆心角${n}°，扇形面积=？（π≈3.14）`, a:`${Math.round(3.14*r*r*n/360*100)/100}cm²`, kp:'扇形面积'}; } },
  { subject:'数学', grades:['初三'], topic:'相似三角形', type:'calculation', difficulty:4, count:60,
    gen() { const a=rand(2,6),b=rand(2,6),k=rand(2,4); return {q:`△ABC∼△DEF，AB=${a}，DE=${a*k}，BC=${b}，EF=？`, a:`${b*k}`, kp:'相似比'}; } },
  { subject:'数学', grades:['初三'], topic:'锐角三角函数', type:'calculation', difficulty:5, count:80,
    gen() { const d=[30,45,60]; const deg=pick(d); const f={30:{sin:'1/2',cos:'√3/2',tan:'√3/3'},45:{sin:'√2/2',cos:'√2/2',tan:'1'},60:{sin:'√3/2',cos:'1/2',tan:'√3'}}; return {q:`sin/cos/tan ${deg}° = ？`, a:JSON.stringify(f[deg]), kp:'特殊角三角函数'}; } },
  { subject:'数学', grades:['初三'], topic:'概率', type:'calculation', difficulty:3, count:60,
    gen() { const n=rand(3,10),k=rand(1,n-1); return {q:`${n}个球中${k}个红球，摸到红球的概率？`, a:fracStr(k,n), kp:'古典概型'}; } },

  // ========== 高一 ==========
  { subject:'数学', grades:['高一'], topic:'集合', type:'calculation', difficulty:3, count:80,
    gen() { const a1=rand(1,5),a2=rand(a1+1,10),b1=rand(3,8),b2=rand(b1+1,12); const l=Math.max(a1,b1),r=Math.min(a2,b2); return {q:`A=[${a1},${a2}]，B=[${b1},${b2}]，A∩B=？`, a:l<=r?`[${l},${r}]`:'∅', kp:'交集'}; } },
  { subject:'数学', grades:['高一'], topic:'集合', type:'calculation', difficulty:3, count:60,
    gen() { const a1=rand(1,5),a2=rand(a1+1,10),b1=rand(3,8),b2=rand(b1+1,12); return {q:`A=[${a1},${a2}]，B=[${b1},${b2}]，A∪B=？`, a:`[${Math.min(a1,b1)},${Math.max(a2,b2)}]`, kp:'并集'}; } },
  { subject:'数学', grades:['高一'], topic:'函数定义域', type:'fill', difficulty:3, count:60,
    gen() { const a=rand(1,9); return {q:`f(x)=1/(x-${a})的定义域？`, a:`x≠${a}，即(-∞,${a})∪(${a},+∞)`, kp:'定义域'}; } },
  { subject:'数学', grades:['高一'], topic:'函数定义域', type:'fill', difficulty:3, count:50,
    gen() { const a=rand(1,9); return {q:`f(x)=√(x-${a})的定义域？`, a:`x≥${a}，即[${a},+∞)`, kp:'定义域'}; } },
  { subject:'数学', grades:['高一'], topic:'指数函数', type:'calculation', difficulty:4, count:60,
    gen() { const a=rand(-3,5); return {q:`2^${a} × 2^${rand(-3,5)} = ？（用指数表示）`, a:`2^${a+rand(-3,5)}`, kp:'指数运算'}; } },
  { subject:'数学', grades:['高一'], topic:'对数', type:'calculation', difficulty:4, count:80,
    gen() { const b=rand(2,5),n=rand(1,4); return {q:`log_${b}(${Math.pow(b,n)}) = ？`, a:`${n}`, kp:'对数'}; } },
  { subject:'数学', grades:['高一'], topic:'对数', type:'calculation', difficulty:4, count:60,
    gen() { const a=rand(2,8),b=rand(2,8); return {q:`log_2(${a}) + log_2(${b}) = log_2(？)`, a:`${a*b}`, kp:'对数加法'}; } },
  { subject:'数学', grades:['高一'], topic:'三角函数', type:'calculation', difficulty:4, count:80,
    gen() { const x=pick([0,30,45,60,90,120,135,150,180,210,225,240,270,300,315,330,360]); return {q:`sin(${x}°) = ？`, a:sineDeg(x), kp:'三角函数值'}; } },
  { subject:'数学', grades:['高一'], topic:'三角函数', type:'calculation', difficulty:4, count:60,
    gen() { const x=rand(0,360); return {q:`sin²(${x}°) + cos²(${x}°) = ？`, a:'1', kp:'同角公式'}; } },
  { subject:'数学', grades:['高一'], topic:'向量', type:'calculation', difficulty:4, count:60,
    gen() { const x1=rand(-5,5),y1=rand(-5,5),x2=rand(-5,5),y2=rand(-5,5); return {q:`a=(${x1},${y1}),b=(${x2},${y2})，a·b=？`, a:`${x1*x2+y1*y2}`, kp:'数量积'}; } },

  // ========== 高二 ==========
  { subject:'数学', grades:['高二'], topic:'数列', type:'calculation', difficulty:4, count:80,
    gen() { const a1=rand(1,10),d=rand(2,6),n=rand(5,20); return {q:`等差数列a₁=${a1},d=${d}，a${n}=？`, a:`${a1+(n-1)*d}`, kp:'等差数列通项'}; } },
  { subject:'数学', grades:['高二'], topic:'数列', type:'calculation', difficulty:4, count:70,
    gen() { const a1=rand(1,10),an=rand(15,60),n=rand(5,20); return {q:`等差数列a₁=${a1},a${n}=${an},n=${n}，S${n}=？`, a:`${(a1+an)*n/2}`, kp:'等差数列求和'}; } },
  { subject:'数学', grades:['高二'], topic:'数列', type:'calculation', difficulty:4, count:60,
    gen() { const a1=rand(1,5),r=rand(2,4),n=rand(3,8); return {q:`等比数列a₁=${a1},q=${r}，a${n}=？`, a:`${a1*Math.pow(r,n-1)}`, kp:'等比数列通项'}; } },
  { subject:'数学', grades:['高二'], topic:'导数', type:'calculation', difficulty:5, count:80,
    gen() { const a=rand(1,5),b=rand(1,5),c=rand(-10,10); return {q:`f(x)=${a}x²+${b}x+${c}，f'(x)=？`, a:`${2*a}x+${b}`, kp:'求导'}; } },
  { subject:'数学', grades:['高二'], topic:'导数', type:'calculation', difficulty:5, count:60,
    gen() { const a=rand(1,3),b=rand(-5,5),c=rand(-5,5),x=rand(-3,3); return {q:`f(x)=x³${b>=0?'+'+b:b}x${c>=0?'+'+c:c}，f'(${x})=？`, a:`${3*x*x+b}`, kp:'求导'}; } },
  { subject:'数学', grades:['高二'], topic:'概率统计', type:'calculation', difficulty:4, count:60,
    gen() { const n=rand(5,12),k=rand(2,Math.min(5,n)); return {q:`C(${n},${k})=？（组合数）`, a:`${combination(n,k)}`, kp:'组合数'}; } },
  { subject:'数学', grades:['高二'], topic:'立体几何', type:'calculation', difficulty:5, count:60,
    gen() { const l=rand(2,10),w=rand(2,10),h=rand(2,15); return {q:`长方体${l}×${w}×${h}，对角线长=？`, a:`${Math.round(Math.sqrt(l*l+w*w+h*h)*100)/100}`, kp:'长方体对角线'}; } },
  { subject:'数学', grades:['高二'], topic:'解析几何', type:'calculation', difficulty:5, count:60,
    gen() { const r=rand(2,10); return {q:`圆x²+y²=${r*r}的半径？`, a:`${r}`, kp:'圆的方程'}; } },
  { subject:'数学', grades:['高二'], topic:'解析几何', type:'calculation', difficulty:5, count:50,
    gen() { const a=rand(2,6),b=rand(1,5); return {q:`椭圆x²/${a*a}+y²/${b*b}=1的离心率？`, a:`e=√(${a*a-b*b})/${a}`, kp:'椭圆离心率'}; } },

  // ========== 高三 ==========
  { subject:'数学', grades:['高三'], topic:'综合复习', type:'calculation', difficulty:5, count:80,
    gen() { const a=rand(1,3),b=rand(2,5),c=rand(-5,5),x=rand(0,5); return {q:`f(x)=${a}x³-${b}x²+${c}x，求f'(${x})`, a:`${3*a*x*x-2*b*x+c}`, kp:'导数综合'}; } },
  { subject:'数学', grades:['高三'], topic:'综合复习', type:'calculation', difficulty:5, count:80,
    gen() { const a=rand(2,5),b=rand(1,4); return {q:`椭圆x²/${a*a}+y²/${b*b}=1离心率e=？`, a:`√(${a*a-b*b})/${a}`, kp:'离心率'}; } },
  { subject:'数学', grades:['高三'], topic:'综合复习', type:'calculation', difficulty:5, count:70,
    gen() { const mu=rand(60,80),s=rand(5,15),x=rand(mu-20,mu+20); return {q:`X~N(${mu},${s}²)，求z-score of x=${x}`, a:`z=${Math.round((x-mu)/s*100)/100}`, kp:'正态标准化'}; } },
  { subject:'数学', grades:['高三'], topic:'综合复习', type:'calculation', difficulty:5, count:80,
    gen() { const a=rand(1,5),b=rand(-3,5),n=rand(5,20); return {q:`∫(x=${a} to ${b}) (x²) dx = ？`, a:`${Math.round((b*b*b/3-a*a*a/3)*100)/100}`, kp:'定积分'}; } },
  { subject:'数学', grades:['高三'], topic:'综合复习', type:'calculation', difficulty:5, count:70,
    gen() { const a=rand(1,5),b=rand(1,5); return {q:`复数(${a}+${b}i)(${a}-${b}i)=？`, a:`${a*a+b*b}`, kp:'复数'}; } },
  { subject:'数学', grades:['高三'], topic:'综合复习', type:'calculation', difficulty:5, count:70,
    gen() { const a=rand(2,9),n=rand(5,10); return {q:`(x+${a})^${n}展开式中x²的系数？`, a:`C(${n},${n-2})×${a}^${n-2}=${combination(n,n-2)*Math.pow(a,n-2)}`, kp:'二项式定理'}; } },
];

// ========== 物理模板 ==========
const PHYSICS_TEMPLATES = [
  { subject:'物理', grades:['初二'], topic:'速度', type:'calculation', difficulty:3, count:80,
    gen() { const s=rand(100,5000),t=rand(10,3600); return {q:`汽车行${s}m用${t}s，平均速度=？m/s`, a:`${Math.round(s/t*100)/100}m/s`, kp:'v=s/t'}; } },
  { subject:'物理', grades:['初二'], topic:'密度', type:'calculation', difficulty:3, count:60,
    gen() { const m=rand(10,5000),v=randFloat(0.5,100,2); return {q:`质量${m}g体积${v}cm³，密度=？g/cm³`, a:`${Math.round(m/v*100)/100}g/cm³`, kp:'ρ=m/V'}; } },
  { subject:'物理', grades:['初二'], topic:'重力', type:'calculation', difficulty:3, count:60,
    gen() { const m=rand(1,200); return {q:`质量${m}kg，重力=？N（g=10N/kg）`, a:`${m*10}N`, kp:'G=mg'}; } },
  { subject:'物理', grades:['初二'], topic:'压强', type:'calculation', difficulty:3, count:60,
    gen() { const F=rand(10,1000),S=randFloat(0.01,10,3); return {q:`压力${F}N面积${S}m²，压强=？Pa`, a:`${Math.round(F/S)}Pa`, kp:'p=F/S'}; } },
  { subject:'物理', grades:['初二'], topic:'浮力', type:'calculation', difficulty:4, count:60,
    gen() { const V=randFloat(0.001,0.1,4); return {q:`排水${V}m³，浮力=？N（ρ水=1000,g=10）`, a:`${Math.round(1000*10*V)}N`, kp:'F浮=ρgV'}; } },
  { subject:'物理', grades:['初二'], topic:'杠杆', type:'calculation', difficulty:4, count:50,
    gen() { const L1=rand(1,5),F1=rand(10,200),L2=rand(1,5); return {q:`动力臂${L1}m动力${F1}N阻力臂${L2}m，阻力=？N`, a:`${Math.round(F1*L1/L2)}N`, kp:'F1L1=F2L2'}; } },
  { subject:'物理', grades:['初二'], topic:'功', type:'calculation', difficulty:3, count:60,
    gen() { const F=rand(10,500),s=rand(1,100); return {q:`${F}N力推物体移${s}m，做功=？J`, a:`${F*s}J`, kp:'W=Fs'}; } },
  { subject:'物理', grades:['初三'], topic:'欧姆定律', type:'calculation', difficulty:4, count:80,
    gen() { const U=rand(1,220),R=rand(1,100); return {q:`电压${U}V电阻${R}Ω，电流=？A`, a:`${Math.round(U/R*1000)/1000}A`, kp:'I=U/R'}; } },
  { subject:'物理', grades:['初三'], topic:'电功率', type:'calculation', difficulty:4, count:70,
    gen() { const U=rand(110,220),I=randFloat(1,10,2); return {q:`${U}V${I}A，功率=？W`, a:`${Math.round(U*I*10)/10}W`, kp:'P=UI'}; } },
  { subject:'物理', grades:['初三'], topic:'焦耳定律', type:'calculation', difficulty:4, count:60,
    gen() { const I=randFloat(0.5,5,2),R=rand(5,100),t=rand(60,3600); return {q:`${I}A过${R}Ω${t}s，热量=？J`, a:`${Math.round(I*I*R*t)}J`, kp:'Q=I²Rt'}; } },
  { subject:'物理', grades:['初三'], topic:'电功率', type:'calculation', difficulty:4, count:50,
    gen() { const U=rand(110,220),R=rand(10,200); return {q:`${U}V${R}Ω，功率=？W（P=U²/R）`, a:`${Math.round(U*U/R)}W`, kp:'P=U²/R'}; } },
  { subject:'物理', grades:['高一'], topic:'匀变速运动', type:'calculation', difficulty:3, count:70,
    gen() { const v0=rand(0,20),a=randFloat(0.5,5,1),t=rand(1,10); return {q:`v₀=${v0}m/s,a=${a}m/s²,t=${t}s,v=？`, a:`${Math.round((v0+a*t)*10)/10}m/s`, kp:'v=v₀+at'}; } },
  { subject:'物理', grades:['高一'], topic:'牛顿定律', type:'calculation', difficulty:4, count:70,
    gen() { const m=rand(1,50),F=rand(5,500); return {q:`m=${m}kg,F=${F}N,a=？m/s²`, a:`${Math.round(F/m*100)/100}m/s²`, kp:'F=ma'}; } },
  { subject:'物理', grades:['高一'], topic:'摩擦力', type:'calculation', difficulty:4, count:60,
    gen() { const mu=randFloat(0.1,0.8,2),m=rand(1,50); return {q:`m=${m}kg,μ=${mu},f=？N(g=10)`, a:`${mu*m*10}N`, kp:'f=μN'}; } },
  { subject:'物理', grades:['高一'], topic:'平抛运动', type:'calculation', difficulty:5, count:60,
    gen() { const v0=rand(5,30),h=rand(5,80),t=Math.sqrt(2*h/10); return {q:`高${h}m以${v0}m/s平抛，落地t=？s(g=10)`, a:`${Math.round(t*100)/100}s`, kp:'平抛'}; } },
  { subject:'物理', grades:['高一'], topic:'万有引力', type:'calculation', difficulty:4, count:50,
    gen() { const m1=randFloat(1,100,1),m2=randFloat(1,100,1),r=randFloat(1,10,1); return {q:`${m1}kg,${m2}kg,相距${r}m,F=？N(G=6.67×10⁻¹¹)`, a:`${Math.round(6.67e-11*m1*m2/(r*r)*1e16)/1e16}N`, kp:'万有引力'}; } },
  { subject:'物理', grades:['高二'], topic:'电场', type:'calculation', difficulty:5, count:60,
    gen() { const q=randFloat(1,9,0)*1e-6,Q=randFloat(1,9,0)*1e-6,r=randFloat(0.1,2,2); return {q:`q=${q*1e6}μC,Q=${Q*1e6}μC,r=${r}m,F=？（k=9×10⁹）`, a:`${Math.round(9e9*q*Q/(r*r)*100)/100}N`, kp:'库仑定律'}; } },
  { subject:'物理', grades:['高二'], topic:'电路串并联', type:'calculation', difficulty:4, count:60,
    gen() { const R1=rand(5,50),R2=rand(5,50); return {q:`R₁=${R1}ΩR₂=${R2}Ω串联，总R=？Ω`, a:`${R1+R2}Ω`, kp:'串联'}; } },
  { subject:'物理', grades:['高二'], topic:'电路串并联', type:'calculation', difficulty:4, count:60,
    gen() { const R1=rand(5,50),R2=rand(5,50); return {q:`R₁=${R1}ΩR₂=${R2}Ω并联，总R=？`, a:`${Math.round(R1*R2/(R1+R2)*100)/100}Ω`, kp:'并联'}; } },
  { subject:'物理', grades:['高二'], topic:'安培力', type:'calculation', difficulty:5, count:60,
    gen() { const B=randFloat(0.1,2,1),I=randFloat(1,10,1),L=randFloat(0.1,2,2); return {q:`B=${B}T,I=${I}A,L=${L}m,F安=？N`, a:`${Math.round(B*I*L*100)/100}N`, kp:'F=BIL'}; } },
  { subject:'物理', grades:['高二'], topic:'电磁感应', type:'calculation', difficulty:5, count:60,
    gen() { const B=randFloat(0.1,3,2),A=randFloat(0.01,0.5,3),t=randFloat(0.1,5,2); return {q:`ΔΦ=B·A=${Math.round(B*A*1000)/1000},Δt=${t}s,E=？V`, a:`${Math.round(B*A/t*10000)/10000}V`, kp:'法拉第定律'}; } },
  { subject:'物理', grades:['高三'], topic:'动量守恒', type:'calculation', difficulty:5, count:60,
    gen() { const m1=rand(1,10),v1=rand(1,20),m2=rand(1,10),v2=rand(-10,10); return {q:`m₁=${m1}(v₁=${v1}),m₂=${m2}(v₂=${v2}),碰后共速v=？`, a:`${Math.round((m1*v1+m2*v2)/(m1+m2)*100)/100}m/s`, kp:'动量守恒'}; } },
  { subject:'物理', grades:['高三'], topic:'能量守恒', type:'calculation', difficulty:5, count:50,
    gen() { const m=rand(1,10),h=rand(5,50); return {q:`m=${m}kg从高${h}m落下(g=10)，落地速度=？m/s`, a:`${Math.round(Math.sqrt(2*10*h)*10)/10}m/s`, kp:'机械能守恒'}; } },
  { subject:'物理', grades:['高三'], topic:'原子物理', type:'fill', difficulty:3, count:50,
    gen() { const n=rand(2,5); return {q:`氢原子n=${n}→基态，发出几种光子？`, a:`${n*(n-1)/2}种`, kp:'能级跃迁'}; } },
];

// ========== 化学模板 ==========
const CHEMISTRY_TEMPLATES = [
  { subject:'化学', grades:['初三'], topic:'化学方程式配平', type:'calculation', difficulty:3, count:60,
    gen() { const rxns=[['H₂+O₂→H₂O','2H₂+O₂→2H₂O'],['Fe+O₂→Fe₃O₄','3Fe+2O₂→Fe₃O₄'],['KClO₃→KCl+O₂','2KClO₃→2KCl+3O₂'],['CH₄+O₂→CO₂+H₂O','CH₄+2O₂→CO₂+2H₂O'],['Al+O₂→Al₂O₃','4Al+3O₂→2Al₂O₃'],['Mg+O₂→MgO','2Mg+O₂→2MgO']]; const r=pick(rxns); return {q:`配平：${r[0]}`, a:r[1], kp:'配平'}; } },
  { subject:'化学', grades:['初三'], topic:'相对分子质量', type:'calculation', difficulty:2, count:60,
    gen() { const c=pick([{f:'H₂O',m:18},{f:'CO₂',m:44},{f:'NaCl',m:58.5},{f:'H₂SO₄',m:98},{f:'CaCO₃',m:100},{f:'NaOH',m:40},{f:'Ca(OH)₂',m:74},{f:'Na₂CO₃',m:106},{f:'HCl',m:36.5},{f:'NH₃',m:17}]); return {q:`${c.f}相对分子质量=？（H=1,O=16,C=12,Na=23,S=32,Cl=35.5,Ca=40,N=14）`, a:`${c.m}`, kp:'分子量'}; } },
  { subject:'化学', grades:['初三'], topic:'质量守恒', type:'calculation', difficulty:3, count:60,
    gen() { const A=rand(10,50),B=rand(10,50),C=rand(10,80); return {q:`A+${A}g与B+${B}g反应得C+${C}g，消耗A？g`, a:`${A}g`, kp:'质量守恒'}; } },
  { subject:'化学', grades:['高一'], topic:'物质的量', type:'calculation', difficulty:4, count:80,
    gen() { const m=rand(10,200),M=pick([18,44,32,28,2,16,40,56,98,58.5,17,36.5,160,100,74]); return {q:`${m}g物质(M=${M})，n=？mol`, a:`${Math.round(m/M*1000)/1000}mol`, kp:'n=m/M'}; } },
  { subject:'化学', grades:['高一'], topic:'物质的量', type:'calculation', difficulty:4, count:60,
    gen() { const n=randFloat(0.1,2,2),N=n*6.02e23; return {q:`${n}mol物质，含几个分子？(NA=6.02×10²³)`, a:`${Math.round(N/1e21)/1e3}×10²³`, kp:'N=nNA'}; } },
  { subject:'化学', grades:['高一'], topic:'气体摩尔体积', type:'calculation', difficulty:4, count:50,
    gen() { const n=randFloat(0.1,3,2); return {q:`标况下${n}mol气体体积=？L(Vm=22.4)`, a:`${Math.round(n*22.4*10)/10}L`, kp:'V=nVm'}; } },
  { subject:'化学', grades:['高一'], topic:'氧化还原', type:'fill', difficulty:4, count:50,
    gen() { const rxn=pick(['Fe+CuSO₄→FeSO₄+Cu','2Na+Cl₂→2NaCl','Zn+2HCl→ZnCl₂+H₂↑','2H₂+O₂→2H₂O','C+O₂→CO₂']); return {q:`指出氧化剂和还原剂：${rxn}`, a:rxn.includes('Fe')?'还原剂Fe氧化剂CuSO₄':rxn.includes('Na')?'还原剂Na氧化剂Cl₂':rxn.includes('Zn')?'还原剂Zn氧化剂HCl':rxn.includes('H₂')?'还原剂H₂氧化剂O₂':'还原剂C氧化剂O₂', kp:'氧化还原'}; } },
  { subject:'化学', grades:['高一'], topic:'浓度', type:'calculation', difficulty:4, count:60,
    gen() { const n=randFloat(0.1,2,2),V=randFloat(0.1,1,2); return {q:`n=${n}mol,V=${V}L,c=？mol/L`, a:`${Math.round(n/V*100)/100}mol/L`, kp:'c=n/V'}; } },
  { subject:'化学', grades:['高二'], topic:'化学平衡', type:'calculation', difficulty:5, count:60,
    gen() { const a=randFloat(0.1,2,2),b=randFloat(0.1,2,2),c=randFloat(0.1,3,2),d=randFloat(0.1,3,2); return {q:`aA+bB⇌cC+dD平衡：[A]=${a}[B]=${b}[C]=${c}[D]=${d},Kc=？`, a:`${Math.round(Math.pow(c,c)*Math.pow(d,d)/(Math.pow(a,a)*Math.pow(b,b))*100)/100}`, kp:'平衡常数'}; } },
  { subject:'化学', grades:['高三'], topic:'有机化学', type:'fill', difficulty:4, count:50,
    gen() { const formula=pick(['C₄H₁₀','C₅H₁₂','C₄H₈']); return {q:`${formula}有几种同分异构体？`, a:formula==='C₄H₁₀'?'2种':formula==='C₅H₁₂'?'3种':'5种（含环烷烃）', kp:'同分异构'}; } },
  { subject:'化学', grades:['高三'], topic:'有机化学', type:'fill', difficulty:4, count:40,
    gen() { const grp=pick(['-OH','-CHO','-COOH','-NH₂','-COO-']); return {q:`官能团${grp}的名称？`, a:grp==='-OH'?'羟基（醇/酚）':grp==='-CHO'?'醛基':grp==='-COOH'?'羧基':grp==='-NH₂'?'氨基':'酯基', kp:'官能团'}; } },
];

// ======================== 辅助函数 ========================
function gcd(a, b) { a=Math.abs(a); b=Math.abs(b); while(b){[a,b]=[b,a%b];} return a||1; }
function lcm(a, b) { return Math.abs(a*b)/gcd(a,b); }
function factors(n) { n=Math.abs(n); const r=[]; for(let i=1;i<=Math.sqrt(n);i++){if(n%i===0){r.push(i); if(i!==n/i)r.push(n/i);}} return r.sort((a,b)=>a-b); }
function combination(n, k) { if(k>n)return 0; let r=1; for(let i=0;i<k;i++)r=r*(n-i)/(i+1); return r; }

function readChineseNum(n) {
  if(n>=100000000) return '一亿以上';
  const d=['','一','二','三','四','五','六','七','八','九'];
  const u=['','十','百','千'];
  let s='',w=Math.floor(n/10000),r=n%10000;
  if(w)s+=read4(w,d,u)+'万';
  if(r)s+=read4(r,d,u);
  return s||'零';
}
function read4(n,d,u){
  if(!n)return'';
  let s='',th=Math.floor(n/1000),h=Math.floor(n/100)%10,t=Math.floor(n/10)%10,o=n%10;
  if(th)s+=d[th]+'千'; else if(s)s+='零';
  if(h)s+=d[h]+'百'; else if(s&&s[s.length-1]!=='零'&&(t||o))s+='零';
  if(t)s+=d[t]+'十'; else if(s&&s[s.length-1]!=='零'&&o)s+='零';
  if(o)s+=d[o];
  return s.replace(/零+/g,'零').replace(/零$/,'');
}

function sineDeg(deg) {
  const m={0:'0',30:'1/2',45:'√2/2',60:'√3/2',90:'1',120:'√3/2',135:'√2/2',150:'1/2',180:'0',210:'-1/2',225:'-√2/2',240:'-√3/2',270:'-1',300:'-√3/2',315:'-√2/2',330:'-1/2',360:'0'};
  return m[deg]||'查表';
}

const ALL_TEMPLATES = [...MATH_TEMPLATES, ...PHYSICS_TEMPLATES, ...CHEMISTRY_TEMPLATES];

function generateQuestionBank(options = {}) {
  const { subject, grade } = options;
  let templates = ALL_TEMPLATES;
  if (subject) templates = templates.filter(t => t.subject === subject);
  if (grade) templates = templates.filter(t => t.grades.includes(grade));

  const allQuestions = [];
  for (const tpl of templates) {
    const questions = bulkGen(tpl.gen, tpl.count);
    for (const gen of questions) {
      allQuestions.push({
        subject: tpl.subject,
        topic: tpl.topic,
        type: tpl.type,
        difficulty: tpl.difficulty,
        question: gen.q,
        answer: gen.a,
        knowledge_point: gen.kp || tpl.topic,
        tags: tpl.tags || '',
      });
    }
  }
  return allQuestions;
}

function getStats() {
  const stats = {};
  for (const tpl of ALL_TEMPLATES) {
    for (const g of tpl.grades) {
      const key = `${g}-${tpl.subject}`;
      if (!stats[key]) stats[key] = 0;
      stats[key] += tpl.count;
    }
  }
  return stats;
}

module.exports = { generateQuestionBank, getStats };
