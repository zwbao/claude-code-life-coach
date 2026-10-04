// Essentials: the coach's global library. Bilingual; every source checked against its abstract (2026-10).
// Grades: A = meta-analysis / large cohort / RCT with numbers; B = supported but small or hard to quantify; C = official guidance.
import type { PackEntry } from '../types'

export const ESSENTIALS: PackEntry[] = [
  {
    id: "E.1",
    area: "move",
    title: {
      en: "Get up and walk for 2 minutes every 20–30 minutes of sitting",
      zh: "每坐 20–30 分钟，起身走 2 分钟",
    },
    cost: {
      en: "Free; a few minutes an hour; needs a reminder",
      zh: "不花钱；每小时几分钟；需要设个提醒",
    },
    human: {
      en: "Short walking breaks during long sitting blunt the rise in blood sugar and insulin after a meal — by roughly a quarter in one trial. It is one of the cheapest things you can do at a desk.",
      zh: "久坐时隔一会儿起来走两分钟，能压住饭后血糖和胰岛素的上升，在一项试验里大约少了四分之一。这是坐办公桌的人最省事的一招。",
    },
    gain: {
      en: "Dunstan 2012, randomised 3-way crossover, n=19 overweight/obese adults aged 45–65: 2-min light walking every 20 min vs uninterrupted sitting, 5 h after a 75 g glucose/50 g fat drink — glucose iAUC 5.2 (95% CI 4.1–6.6) vs 6.9 (5.5–8.7) mmol/L·h; insulin iAUC 633.6 (552.4–727.1) vs 828.6 (722.0–950.9) pmol/L·h (both P<0.01). Moderate-intensity walking breaks: glucose 4.9 (3.8–6.1). Loh 2020 meta-analysis (37 trials): activity breaks vs continuous sitting SMD −0.54 (−0.70 to −0.37) for glucose, −0.56 (−0.74 to −0.38) for insulin, −0.26 (−0.44 to −0.09) for triglycerides. Buffey 2022 (7 crossover trials): light walking breaks reduced glucose (Δ −0.72, −1.03 to −0.41) and insulin (Δ −0.83, −1.18 to −0.48); standing breaks reduced glucose only (Δ −0.31).",
      zh: "Dunstan 2012，随机三阶段交叉试验，19 名 45–65 岁超重/肥胖成人：每 20 分钟轻度步行 2 分钟 vs 连续久坐，饮用 75 克葡萄糖/50 克脂肪饮料后 5 小时内——血糖 iAUC 5.2（95% CI 4.1–6.6）vs 6.9（5.5–8.7）mmol/L·h；胰岛素 iAUC 633.6（552.4–727.1）vs 828.6（722.0–950.9）pmol/L·h（均 P<0.01）。中等强度步行间断：血糖 4.9（3.8–6.1）。Loh 2020 荟萃分析（37 项试验）：活动间断 vs 连续久坐，血糖 SMD −0.54（−0.70 至 −0.37），胰岛素 −0.56（−0.74 至 −0.38），甘油三酯 −0.26（−0.44 至 −0.09）。Buffey 2022（7 项交叉试验）：轻度步行间断降低血糖（Δ −0.72，−1.03 至 −0.41）和胰岛素（Δ −0.83，−1.18 至 −0.48）；站立间断只降低血糖（Δ −0.31）。",
    },
    grade: "A",
    src: "Dunstan DW, et al. (2012). Breaking up prolonged sitting reduces postprandial glucose and insulin responses. Diabetes Care. https://doi.org/10.2337/dc11-1931 ; Loh R, et al. (2020). Effects of interrupting prolonged sitting with physical activity breaks on blood glucose, insulin and triacylglycerol measures: a systematic review and meta-analysis. Sports Medicine. https://doi.org/10.1007/s40279-019-01183-w ; Buffey AJ, et al. (2022). The acute effects of interrupting prolonged sitting time in adults with standing and light-intensity walking on biomarkers of cardiometabolic health in adults: a systematic review and meta-analysis. Sports Medicine. https://doi.org/10.1007/s40279-022-01649-4",
    note: {
      en: "These are short-term blood sugar and insulin results from one-day lab trials, not proof of fewer diseases or a longer life. The best-tested pattern is a break every 20 minutes; longer gaps were not tested here. Benefits were larger in people with higher body weight. Walking beat just standing up.",
      zh: "这些是单日实验室里测到的短期血糖、胰岛素变化，并不直接证明能少得病或更长寿。研究最多的是每 20 分钟起来一次，间隔更长的效果这里没有验证。体重越高的人获益越明显。走动比只是站起来效果更好。",
    },
    money: "0", time: "少", will: "些", level: "小", lens: "死亡率",
  },
  {
    id: "E.2",
    area: "move",
    title: {
      en: "Build up about an hour of brisk activity a day if you sit a lot",
      zh: "如果你久坐，每天累计约一小时中等强度活动",
    },
    cost: {
      en: "Free; 60–75 minutes a day; takes real commitment",
      zh: "不花钱；每天 60–75 分钟；需要下决心坚持",
    },
    human: {
      en: "People who sat more than 8 hours a day and barely moved had about 59% higher risk of dying during the studies than people who sat little and were very active. People who sat just as long but did about 60–75 minutes of brisk activity, such as fast walking, every day showed no clear extra risk.",
      zh: "每天坐 8 小时以上、又几乎不活动的人，研究期间的死亡风险比坐得少又很爱动的人高出约 59%。同样久坐、但每天有 60–75 分钟快走这类中等强度活动的人，看不到明显的额外风险。",
    },
    gain: {
      en: "Ekelund 2016 harmonised meta-analysis of 16 cohorts; 13 with sitting data: 1,005,791 people, 84,609 deaths (8.4%), 2–18.1 y follow-up. Reference: <4 h/day sitting and most active quartile (>35.5 MET-h/wk). Sitting >8 h/day + least active quartile (<2.5 MET-h/wk): HR 1.59 (95% CI 1.52–1.66). Sitting >8 h/day + most active quartile: HR 1.04 (0.99–1.10). Sitting <4 h/day + least active: HR 1.27 (1.22–1.31). Authors: about 60–75 min/day of moderate activity seems to eliminate the excess risk of high sitting time, but only attenuates that of high TV time (≥5 h/day TV in most active quartile: HR 1.16, 1.05–1.28).",
      zh: "Ekelund 2016 统一口径荟萃分析，16 个队列；其中 13 个有久坐数据：1,005,791 人，84,609 人死亡（8.4%），随访 2–18.1 年。参照组：每天坐不到 4 小时且活动量最高四分位（>35.5 MET-小时/周）。每天坐 >8 小时 + 活动量最低四分位（<2.5 MET-小时/周）：HR 1.59（95% CI 1.52–1.66）。每天坐 >8 小时 + 活动量最高四分位：HR 1.04（0.99–1.10）。每天坐 <4 小时 + 活动量最低：HR 1.27（1.22–1.31）。作者结论：每天约 60–75 分钟中等强度活动似乎能抵消久坐带来的额外死亡风险，但对长时间看电视只能部分抵消（活动量最高组中每天看电视 ≥5 小时：HR 1.16，1.05–1.28）。",
    },
    grade: "A",
    src: "Ekelund U, et al. (2016). Does physical activity attenuate, or even eliminate, the detrimental association of sitting time with mortality? A harmonised meta-analysis of data from more than 1 million men and women. The Lancet. https://doi.org/10.1016/S0140-6736(16)30370-1",
    note: {
      en: "Observational data: very active people differ from inactive people in many ways. An hour a day is a high bar — any amount of activity beats none (see E.4). Heavy TV watching stayed risky even for active people.",
      zh: "这是观察性数据：很爱动的人和不爱动的人本来就有很多差别。每天一小时门槛不低，但动一点总比不动好（见 E.4）。长时间看电视的风险，即使经常运动也只能部分抵消。",
    },
    money: "0", time: "多", will: "是", level: "大", lens: "死亡率",
  },
  {
    id: "E.3",
    area: "move",
    title: {
      en: "Walk about 8,000–10,000 steps a day (6,000–8,000 if you are 60 or older)",
      zh: "每天走 8000–10000 步（60 岁及以上走 6000–8000 步）",
    },
    cost: {
      en: "Free; walking spread through the day; a step counter helps",
      zh: "不花钱；分散在一天里走；有个计步器更容易坚持",
    },
    human: {
      en: "Compared with people taking about 3,500 steps a day, those taking about 7,800 had roughly 45% lower risk of dying during the studies. The benefit kept growing until about 6,000–8,000 steps for people 60 and older and 8,000–10,000 for younger adults, then levelled off.",
      zh: "和每天大约 3500 步的人相比，每天约 7800 步的人在研究期间的死亡风险低了约 45%。60 岁及以上的人走到 6000–8000 步、更年轻的人走到 8000–10000 步时，好处基本到顶，再多走帮助不大。",
    },
    gain: {
      en: "Paluch 2022 meta-analysis of 15 cohorts: 47,471 adults, 3,013 deaths, median follow-up 7.1 y. Vs lowest quartile (median 3,553 steps/day): HR 0.60 (95% CI 0.51–0.71) for Q2 (5,801), 0.55 (0.49–0.62) for Q3 (7,842), 0.47 (0.39–0.57) for Q4 (10,901). Risk declined progressively until 6,000–8,000 steps/day in adults ≥60 y and 8,000–10,000 steps/day in adults <60 y. After adjusting for total steps, time walking at ≥100 steps/min was not significantly associated with mortality (HR 0.86, 0.58–1.28).",
      zh: "Paluch 2022 对 15 个队列的荟萃分析：47,471 名成人，3,013 人死亡，中位随访 7.1 年。与最低四分位（中位数每天 3,553 步）相比：第二四分位（5,801 步）HR 0.60（95% CI 0.51–0.71），第三四分位（7,842 步）0.55（0.49–0.62），第四四分位（10,901 步）0.47（0.39–0.57）。60 岁及以上人群的死亡风险随步数增加持续下降至每天 6,000–8,000 步，60 岁以下人群至 8,000–10,000 步。校正总步数后，以每分钟 ≥100 步速度行走的时间与死亡率无显著关联（HR 0.86，0.58–1.28）。",
    },
    grade: "A",
    src: "Paluch AE, et al. (2022). Daily steps and all-cause mortality: a meta-analysis of 15 international cohorts. The Lancet Public Health. https://doi.org/10.1016/S2468-2667(21)00302-9",
    note: {
      en: "Observational: people who are already unwell tend to walk less, which can make the link look stronger. If you are far below the target, every step up still counts — the biggest drop in risk came between the lowest and second-lowest groups.",
      zh: "这是观察性研究：本来身体就不好的人走得少，会让关联看起来更强。离目标还远也没关系，每多走一些都算数——风险下降最大的一段，正是从最少的那组到次少的那组。",
    },
    money: "0", time: "中", will: "些", level: "大", lens: "死亡率",
  },
  {
    id: "E.4",
    area: "move",
    title: {
      en: "Get 150–300 minutes of moderate exercise a week, plus strength training on 2 days",
      zh: "每周 150–300 分钟中等强度运动，另加 2 天力量训练",
    },
    cost: {
      en: "Free, or a gym fee if you want one; 2.5–5 hours a week; needs a fixed routine",
      zh: "可以不花钱（想去健身房另算）；每周 2.5–5 小时；需要固定安排",
    },
    human: {
      en: "Meeting the basic weekly target was linked to about 31% lower risk of dying over 14 years than doing no exercise; doing 3–5 times as much added only a little more. Strength training was linked separately to about 10–17% lower risk.",
      zh: "达到每周基本运动量的人，14 年里的死亡风险比完全不运动的人低约 31%；练到 3–5 倍的量，好处也只再多一点。力量训练另外还与死亡风险降低约 10%–17% 有关。",
    },
    gain: {
      en: "WHO 2020 guidelines (Bull 2020): adults should do 150–300 min/wk moderate or 75–150 min/wk vigorous aerobic activity (or an equivalent mix), plus muscle-strengthening at moderate or greater intensity involving all major muscle groups on ≥2 days/wk; reduce sedentary time (no threshold could be quantified). Arem 2015 pooled 6 cohorts (661,137 adults, 116,686 deaths, median follow-up 14.2 y), vs no leisure activity: HR 0.80 (0.78–0.82) below the minimum (7.5 MET-h/wk), 0.69 (0.67–0.70) at 1–2× minimum, 0.63 (0.62–0.65) at 2–3×, 0.61 (0.59–0.62) at 3–5×; no harm at ≥10× (HR 0.69, 0.59–0.78). Momma 2022 meta-analysis (16 cohorts): muscle-strengthening linked to 10–17% lower risk of all-cause mortality, CVD, total cancer, diabetes and lung cancer, independent of aerobic activity; maximum reduction (~10–20%) at ~30–60 min/wk.",
      zh: "世卫组织 2020 年指南（Bull 2020）：成人每周应进行 150–300 分钟中等强度或 75–150 分钟高强度有氧活动（或等量组合），另外每周至少 2 天进行涉及所有主要肌群的中等及以上强度力量训练；减少久坐时间（证据不足以给出具体阈值）。Arem 2015 汇总 6 个队列（661,137 名成人，116,686 人死亡，中位随访 14.2 年），与无闲暇活动者相比：低于最低推荐量（7.5 MET-小时/周）HR 0.80（0.78–0.82），1–2 倍 0.69（0.67–0.70），2–3 倍 0.63（0.62–0.65），3–5 倍 0.61（0.59–0.62）；≥10 倍未见害处（HR 0.69，0.59–0.78）。Momma 2022 荟萃分析（16 个队列）：力量训练与全因死亡、心血管病、癌症总体、糖尿病和肺癌风险降低 10%–17% 相关，独立于有氧运动；每周约 30–60 分钟时降幅最大（约 10%–20%）。",
    },
    grade: "A",
    src: "Bull FC, et al. (2020). World Health Organization 2020 guidelines on physical activity and sedentary behaviour. British Journal of Sports Medicine. https://doi.org/10.1136/bjsports-2020-102955 ; Arem H, et al. (2015). Leisure time physical activity and mortality: a detailed pooled analysis of the dose-response relationship. JAMA Internal Medicine. https://doi.org/10.1001/jamainternmed.2015.0533 ; Momma H, et al. (2022). Muscle-strengthening activities are associated with lower risk and mortality in major non-communicable diseases: a systematic review and meta-analysis of cohort studies. British Journal of Sports Medicine. https://doi.org/10.1136/bjsports-2021-105061",
    note: {
      en: "The mortality numbers come from observational cohorts. For strength training the benefit peaked around 30–60 minutes a week; whether much more helps is unclear. If you are inactive, start small — some activity beats none. People with heart disease or other serious conditions should check with a doctor before starting hard exercise.",
      zh: "死亡率数据来自观察性队列研究。力量训练的好处在每周约 30–60 分钟时最大，练得更多是否更好还不清楚。平时不运动的人从少量开始就好，动一点总比不动强。有心脏病或其他严重疾病的人，开始高强度运动前先问问医生。",
    },
    money: "0", time: "中", will: "是", level: "大", lens: "死亡率",
  },
  {
    id: "E.5",
    area: "sleep",
    title: {
      en: "Go to bed and get up at the same times every day, weekends included",
      zh: "每天固定时间睡觉和起床，周末也一样",
    },
    cost: {
      en: "Free; no extra time; takes discipline, especially at weekends",
      zh: "不花钱；不额外占时间；需要自律，尤其是周末",
    },
    human: {
      en: "In about 61,000 people who wore activity trackers, those whose sleep times were more regular had a 20–48% lower risk of dying over about 6 years than the least regular group. How regular people's sleep was predicted their risk better than how many hours they slept.",
      zh: "一项约 6.1 万人佩戴手环的研究发现，作息越规律的人，约 6 年里的死亡风险比最不规律的那组低 20%–48%。比起睡了几个小时，睡得规不规律更能预测风险。",
    },
    gain: {
      en: "Windred 2024, UK Biobank: 60,977 participants (62.8 ± 7.8 y), Sleep Regularity Index (SRI) from >10 million hours of accelerometer data; 1,859 deaths, mean follow-up 6.3 y. Across the top four SRI quintiles vs the least regular quintile: 20–48% lower all-cause mortality, 16–39% lower cancer mortality, 22–57% lower cardiometabolic mortality (adjusted for age, sex, ethnicity, sociodemographic, lifestyle and health factors). Sleep regularity was a stronger predictor of all-cause mortality than sleep duration.",
      zh: "Windred 2024，英国生物银行：60,977 名参与者（62.8 ± 7.8 岁），用超过 1000 万小时的加速度计数据计算睡眠规律指数（SRI）；平均随访 6.3 年，1,859 人死亡。SRI 最高四个五分位组与最不规律的五分位组相比：全因死亡风险低 20%–48%，癌症死亡低 16%–39%，心血管代谢疾病死亡低 22%–57%（已校正年龄、性别、种族及社会人口、生活方式和健康因素）。睡眠规律性对全因死亡的预测力强于睡眠时长。",
    },
    grade: "A",
    src: "Windred DP, et al. (2024). Sleep regularity is a stronger predictor of mortality risk than sleep duration: a prospective cohort study. Sleep. https://doi.org/10.1093/sleep/zsad253",
    note: {
      en: "Observational study of mostly older adults in the UK. Irregular sleep can be a sign of illness, shift work or stress, which may explain part of the link. If your schedule is not yours to choose, aim for as much consistency as it allows.",
      zh: "这是观察性研究，对象多为英国中老年人。作息不规律可能本身就反映了疾病、倒班或压力，这能解释一部分关联。如果工作安排由不得你，就在能控制的范围内尽量规律。",
    },
    money: "0", time: "少", will: "是", level: "大", lens: "死亡率",
  },
  {
    id: "E.6",
    area: "sleep",
    title: {
      en: "Stop caffeine at least 6 hours before bed",
      zh: "睡前 6 小时内不再摄入咖啡因",
    },
    cost: {
      en: "Free; no time; some willpower if you rely on an afternoon coffee",
      zh: "不花钱；不占时间；习惯下午来杯咖啡的人需要一点克制",
    },
    human: {
      en: "A large dose of caffeine (400 mg, several cups of coffee) taken 6 hours before bed cut measured sleep by more than an hour — and people did not notice. Moving your last coffee or tea earlier is an easy win.",
      zh: "睡前 6 小时摄入大剂量咖啡因（400 毫克，相当于好几杯咖啡），仪器测到的睡眠少了一个多小时，本人却没察觉。把最后一杯咖啡或茶往前挪，是改善睡眠最省力的办法之一。",
    },
    gain: {
      en: "Drake 2013, randomised placebo-controlled crossover with in-home sleep monitoring: 400 mg caffeine at 0, 3 or 6 h before habitual bedtime each significantly disturbed sleep vs placebo (p<0.05 for all); authors conclude 6 h before bed still has important disruptive effects. Per the AASM release on the study (12 healthy normal sleepers): at 6 h before bed, objectively measured total sleep time was reduced by more than 1 hour, while self-reports suggested participants were unaware of the disturbance.",
      zh: "Drake 2013，随机、安慰剂对照交叉试验，居家睡眠监测：在习惯就寝前 0、3 或 6 小时服用 400 毫克咖啡因，与安慰剂相比均显著干扰睡眠（均 p<0.05）；作者认为即使提前 6 小时仍有明显干扰。据美国睡眠医学会对该研究的发布（12 名睡眠正常的健康成人）：睡前 6 小时服用时，客观测得的总睡眠时间减少超过 1 小时，而自我报告显示受试者并未察觉。",
    },
    grade: "B",
    src: "Drake C, et al. (2013). Caffeine effects on sleep taken 0, 3, or 6 hours before going to bed. Journal of Clinical Sleep Medicine. https://doi.org/10.5664/jcsm.3170 ; American Academy of Sleep Medicine (2013). Late afternoon and early evening caffeine can disrupt sleep at night. https://aasm.org/late-afternoon-and-early-evening-caffeine-can-disrupt-sleep-at-night/",
    note: {
      en: "Small study (12 people) using one large dose; smaller amounts were not tested, and sensitivity to caffeine varies a lot between people. Remember caffeine is also in tea, cola, energy drinks and some medicines.",
      zh: "样本很小（12 人），只测了一个大剂量；小剂量没有测试，而且每个人对咖啡因的敏感度差别很大。别忘了茶、可乐、功能饮料和一些药物里也有咖啡因。",
    },
    money: "0", time: "少", will: "些", level: "中", lens: "时间",
  },
  {
    id: "E.7",
    area: "sleep",
    title: {
      en: "Dim or put away bright screens in the hour before bed",
      zh: "睡前一小时调暗或放下发光屏幕",
    },
    cost: {
      en: "Free; no time; hard if you usually scroll in bed",
      zh: "不花钱；不占时间；习惯躺床上刷手机的人会觉得难",
    },
    human: {
      en: "In a lab study, people who read on a bright tablet before bed instead of a paper book took about 10 minutes longer to fall asleep, made about half as much of the sleep hormone melatonin in the evening, and felt groggier the next morning.",
      zh: "一项实验室研究里，睡前用发光平板看书、而不是看纸质书的人，入睡多花了约 10 分钟，晚上分泌的助眠激素褪黑素少了大约一半，第二天早上也更昏沉。",
    },
    gain: {
      en: "Chang 2015, randomised crossover, 12 healthy young adults (24.9 ± 2.9 y): ~4 h of reading on an iPad vs a printed book in dim room light, 5 consecutive evenings each. Evening melatonin suppressed by 55.1 ± 20.1% (print: no suppression); dim-light melatonin onset >1.5 h later (22:31 vs 21:01); time to fall asleep 25.7 vs 15.8 min (P=0.009); REM sleep 109.0 vs 120.9 min (P=0.03); reduced next-morning alertness. Average sleep duration did not differ.",
      zh: "Chang 2015，随机交叉试验，12 名健康年轻人（24.9 ± 2.9 岁）：在昏暗室内光线下，分别连续 5 晚在 iPad 或纸质书上阅读约 4 小时。晚间褪黑素被抑制 55.1 ± 20.1%（纸质书组无抑制）；昏暗光线下褪黑素开始分泌的时间推迟 1.5 小时以上（22:31 vs 21:01）；入睡时间 25.7 vs 15.8 分钟（P=0.009）；快速眼动睡眠 109.0 vs 120.9 分钟（P=0.03）；次日清晨警觉度下降。平均睡眠时长无差异。",
    },
    grade: "B",
    src: "Chang AM, et al. (2015). Evening use of light-emitting eReaders negatively affects sleep, circadian timing, and next-morning alertness. Proceedings of the National Academy of Sciences of the USA. https://doi.org/10.1073/pnas.1418490112",
    note: {
      en: "Tiny lab study with about 4 hours of bright-tablet reading each night — far more than the last hour before bed; the effect of shorter or dimmer use may be smaller. Total sleep time did not change. Night modes and lower brightness reduce the light but were not tested here.",
      zh: "这是很小的实验室研究，每晚用亮屏平板读约 4 小时，比“睡前一小时”多得多；时间更短、亮度更低时影响可能更小。总睡眠时长没有变化。夜间模式和调低亮度能减少光照，但本研究没有测试。",
    },
    money: "0", time: "少", will: "是", level: "小", lens: "时间",
  },
  {
    id: "E.8",
    area: "work",
    title: {
      en: "Keep your working week under 55 hours",
      zh: "别让每周工时长期超过 55 小时",
    },
    cost: {
      en: "Usually free, but may mean saying no, renegotiating work or earning less",
      zh: "通常不花钱，但可能要推掉任务、重新谈分工，或少拿一些收入",
    },
    human: {
      en: "Working 55 or more hours a week, compared with 35–40, is linked to about 35% higher risk of stroke and 17% higher risk of dying from heart disease. WHO and the International Labour Organization estimate that long hours led to about 745,000 deaths worldwide in 2016.",
      zh: "和每周工作 35–40 小时相比，每周 55 小时以上的人中风风险高约 35%，死于心脏病的风险高约 17%。世界卫生组织和国际劳工组织估计，2016 年全球约有 74.5 万例死亡与长时间工作有关。",
    },
    gain: {
      en: "WHO/ILO systematic reviews, ≥55 vs 35–40 h/week: stroke incidence RR 1.35 (95% CI 1.13–1.61; 7 studies, 162,644 participants; moderate-quality evidence); stroke mortality RR 1.08 (0.89–1.31; not significant, low quality) (Descatha 2020). IHD incidence RR 1.13 (1.02–1.26; 22 studies, 339,680 participants); IHD mortality RR 1.17 (1.05–1.31; 16 studies, 726,803 participants; moderate quality) (Li 2020). 41–48 and 49–54 h/week: no clear excess IHD risk; stroke incidence at 49–54 h RR 1.13 (1.00–1.28). Pega 2021: in 2016, 488 million people (8.9% of the global population) worked ≥55 h/week; 745,194 deaths (705,786–784,601) from IHD and stroke were attributable.",
      zh: "世卫组织/国际劳工组织系统综述，每周 ≥55 小时 vs 35–40 小时：中风发病 RR 1.35（95% CI 1.13–1.61；7 项研究，162,644 人；中等质量证据）；中风死亡 RR 1.08（0.89–1.31；不显著，低质量）（Descatha 2020）。缺血性心脏病发病 RR 1.13（1.02–1.26；22 项研究，339,680 人）；缺血性心脏病死亡 RR 1.17（1.05–1.31；16 项研究，726,803 人；中等质量）（Li 2020）。每周 41–48 和 49–54 小时：未见明确的心脏病额外风险；49–54 小时的中风发病 RR 1.13（1.00–1.28）。Pega 2021：2016 年全球 4.88 亿人（占全球人口 8.9%）每周工作 ≥55 小时；745,194 例（705,786–784,601）缺血性心脏病和中风死亡可归因于此。",
    },
    grade: "A",
    src: "Descatha A, et al. (2020). The effect of exposure to long working hours on stroke: a systematic review and meta-analysis from the WHO/ILO Joint Estimates of the Work-related Burden of Disease and Injury. Environment International. https://doi.org/10.1016/j.envint.2020.105746 ; Li J, et al. (2020). The effect of exposure to long working hours on ischaemic heart disease: a systematic review and meta-analysis from the WHO/ILO Joint Estimates of the Work-related Burden of Disease and Injury. Environment International. https://doi.org/10.1016/j.envint.2020.105739 ; Pega F, et al. (2021). Global, regional, and national burdens of ischemic heart disease and stroke attributable to exposure to long working hours for 194 countries, 2000–2016: a systematic analysis from the WHO/ILO Joint Estimates of the Work-related Burden of Disease and Injury. Environment International. https://doi.org/10.1016/j.envint.2021.106595",
    note: {
      en: "Based on observational studies with self-reported hours. Long hours often come with stress, short sleep and little exercise, which may explain part of the link. The clear risk starts around 55 hours; the evidence for 41–54 hours is uncertain.",
      zh: "依据是观察性研究，工时由本人自报。长时间工作往往伴随压力大、睡得少、运动少，这些可能解释部分关联。明确的风险从每周约 55 小时开始；41–54 小时的证据还不确定。",
    },
    money: "0", time: "少", will: "是", level: "中", lens: "死亡率",
  },
  {
    id: "E.9",
    area: "work",
    title: {
      en: "Take short breaks of up to 10 minutes through the workday",
      zh: "工作中穿插不超过 10 分钟的小休息",
    },
    cost: {
      en: "Free; a few minutes at a time; easy to forget",
      zh: "不花钱；每次几分钟；容易忘",
    },
    human: {
      en: "Brief breaks leave you feeling more energetic and less tired — a small but consistent effect. Don't expect them to raise your output on demanding thinking work; recovering from a draining task may take longer than 10 minutes.",
      zh: "短暂的小休息能让人更有精神、没那么累，效果不大但比较稳定。别指望它能提高费脑工作的产出；从特别耗神的任务里恢复过来，可能需要超过 10 分钟。",
    },
    gain: {
      en: "Albulescu 2022 meta-analysis of experimental and quasi-experimental studies (19 records, 22 samples, N=2,335); micro-breaks defined as breaks of no longer than 10 min. Vigor increased d=0.36 (p<0.001; k=9, n=913); fatigue reduced d=0.35 (p<0.001; k=9, n=803); overall performance d=0.16 (p=0.116, not significant; k=15, n=1,132). Performance effects were significant only for less cognitively demanding tasks; longer breaks gave larger performance gains.",
      zh: "Albulescu 2022 对实验和准实验研究的荟萃分析（19 篇文献，22 个样本，N=2,335），微休息定义为不超过 10 分钟的休息。活力提升 d=0.36（p<0.001；k=9，n=913）；疲劳减轻 d=0.35（p<0.001；k=9，n=803）；整体工作表现 d=0.16（p=0.116，不显著；k=15，n=1,132）。只有认知负荷较低的任务表现有显著提升；休息越长，表现提升越大。",
    },
    grade: "A",
    src: "Albulescu P, et al. (2022). \"Give me a break!\" A systematic review and meta-analysis on the efficacy of micro-breaks for increasing well-being and performance. PLOS ONE. https://doi.org/10.1371/journal.pone.0272460",
    note: {
      en: "Effects are small and mostly measured over short periods. Pair this with walking breaks (E.1) and eye breaks (E.15) so one pause does three jobs.",
      zh: "效果不大，而且多是短期测量。可以和起身走动（E.1）、远眺休息（E.15）合在一起做，一次休息顾到三件事。",
    },
    money: "0", time: "少", will: "些", level: "小", lens: "时间",
  },
  {
    id: "E.10",
    area: "work",
    title: {
      en: "Recognise burnout — exhaustion, cynicism about work, getting less done — and act on it early",
      zh: "认出职业倦怠——身心耗竭、对工作冷漠厌烦、效能下降——并尽早处理",
    },
    cost: {
      en: "Free to notice; acting on it may take hard conversations or time off",
      zh: "察觉不花钱；处理它可能需要艰难的沟通或休假",
    },
    human: {
      en: "WHO describes burnout as the result of long-term work stress that has not been managed well, with three signs: feeling drained, feeling distant or cynical about your job, and getting less done. If all three show up, treat it as a signal to change your workload, boundaries or support — not as a personal failing.",
      zh: "世界卫生组织把职业倦怠定义为长期没处理好的工作压力造成的结果，有三个表现：精力被掏空、对工作疏离或厌烦、工作效能下降。三样都出现时，要把它当成调整工作量、设边界或寻求支持的信号，而不是自己不行。",
    },
    gain: {
      en: "WHO ICD-11 definition: burn-out is 'a syndrome conceptualized as resulting from chronic workplace stress that has not been successfully managed', characterised by (1) feelings of energy depletion or exhaustion; (2) increased mental distance from one's job, or feelings of negativism or cynicism related to one's job; (3) reduced professional efficacy. It is listed as an occupational phenomenon in the chapter 'Factors influencing health status or contact with health services', is not classified as a medical condition, and refers only to the work context.",
      zh: "世卫组织 ICD-11 定义：职业倦怠是一种由未被成功管理的长期工作场所压力所导致的综合征（中文为本库译文），有三个维度：(1) 精力耗竭或疲惫感；(2) 与工作的心理距离加大，或对工作产生消极、愤世嫉俗的感受；(3) 职业效能下降。它被列为“职业现象”，归在“影响健康状态或与卫生服务接触的因素”一章，不属于医学疾病，且只适用于工作情境。",
    },
    grade: "C",
    src: "World Health Organization (2019). Burn-out an \"occupational phenomenon\": International Classification of Diseases. https://www.who.int/news/item/28-05-2019-burn-out-an-occupational-phenomenon-international-classification-of-diseases",
    note: {
      en: "This is an official definition, not evidence that any particular fix works. Exhaustion together with low mood, hopelessness or loss of interest outside work may be depression — see E.13 and get checked.",
      zh: "这是官方定义，不代表某种应对方法已被证明有效。如果疲惫的同时，在工作之外也情绪低落、感到绝望或对什么都提不起兴趣，可能是抑郁——请看 E.13，并找专业人士评估。",
    },
    money: "0", time: "中", will: "是", level: "小", lens: "时间",
  },
  {
    id: "E.11",
    area: "habits",
    title: {
      en: "Write plans as \"When X happens, I will do Y\"",
      zh: "把计划写成“当 X 发生时，我就做 Y”",
    },
    cost: {
      en: "Free; a minute to write; almost no willpower",
      zh: "不花钱；写下来只要一分钟；几乎不费意志力",
    },
    human: {
      en: "Deciding in advance exactly when, where and how you will act makes you noticeably more likely to follow through. Across 94 tests, this simple trick had a medium-to-large effect on reaching goals.",
      zh: "提前定好什么时候、在哪里、怎么做，能明显提高把事做成的概率。94 项研究汇总下来，这个小方法对达成目标的效果属于中到大。",
    },
    gain: {
      en: "Gollwitzer & Sheeran 2006 meta-analysis of 94 independent tests: forming implementation intentions ('If situation Y is encountered, then I will initiate goal-directed behavior X') had a positive effect of medium-to-large magnitude on goal attainment, d = 0.65. They helped people start goal striving, shield ongoing goals from unwanted influences, disengage from failing courses of action, and conserve capability for future striving.",
      zh: "Gollwitzer 与 Sheeran 2006 年对 94 项独立检验的荟萃分析：制定执行意图（“如果遇到情境 Y，我就开始行为 X”）对目标达成有中到大的正向效应，d = 0.65。它有助于开始行动、保护进行中的目标不受干扰、及时放弃行不通的做法，并为后续目标保留精力。",
    },
    grade: "A",
    src: "Gollwitzer PM, Sheeran P (2006). Implementation intentions and goal achievement: a meta-analysis of effects and processes. Advances in Experimental Social Psychology, 38, 69–119. https://doi.org/10.1016/S0065-2601(06)38002-1",
    note: {
      en: "It helps you act on something you already intend; it won't create motivation from nothing. Pick a cue that reliably happens, such as \"after I pour my morning coffee\" or \"when I close my laptop\".",
      zh: "它帮你把已有的打算落实，但不能凭空制造动力。选一个每天一定会出现的提示，比如“倒完早上的咖啡后”或“合上电脑时”。",
    },
    money: "0", time: "少", will: "否", level: "中", lens: "时间",
  },
  {
    id: "E.12",
    area: "habits",
    title: {
      en: "Give a new habit about two months, and don't give up after a missed day",
      zh: "给新习惯两个月左右，偶尔漏一天也别放弃",
    },
    cost: {
      en: "Free; a little each day; more patience than willpower",
      zh: "不花钱；每天一点点；更需要耐心而非意志力",
    },
    human: {
      en: "When people repeated a small daily action like eating fruit or going for a walk after breakfast, it took about 66 days on average for it to feel automatic — anywhere from 18 to 254 days. Missing a single day did not derail the process.",
      zh: "研究里的人每天重复一个小动作，比如早饭后吃水果或散步，平均大约 66 天才变得自然而然，快的 18 天，慢的 254 天。偶尔漏掉一天，并不会打断这个过程。",
    },
    gain: {
      en: "Lally 2010: 96 volunteers performed a chosen eating, drinking or activity behaviour daily in the same context for 12 weeks; 82 provided enough data; an asymptotic model fitted for 62 (good fit for 39). Time to reach 95% of the automaticity plateau ranged from 18 to 254 days; Gardner, Lally & Wardle 2012 report the plateau was reached after an average of 66 days. Missing one opportunity did not materially affect habit formation. Simple actions (e.g. drinking water) became automatic faster than more elaborate routines.",
      zh: "Lally 2010：96 名志愿者在固定情境下每天做一件自选的饮食或活动行为，持续 12 周；82 人数据足够分析，渐近模型拟合成功 62 人（拟合良好 39 人）。达到自动化平台期 95% 所需时间为 18–254 天；Gardner、Lally 与 Wardle 2012 年报告平均约 66 天达到平台期。错过一次机会对习惯形成没有实质影响。简单动作（如喝水）比复杂的日常流程更快变得自动化。",
    },
    grade: "B",
    src: "Lally P, et al. (2010). How are habits formed: modelling habit formation in the real world. European Journal of Social Psychology. https://doi.org/10.1002/ejsp.674 ; Gardner B, Lally P, Wardle J (2012). Making health habitual: the psychology of 'habit-formation' and general practice. British Journal of General Practice. https://doi.org/10.3399/bjgp12X659466",
    note: {
      en: "One small study; automaticity was self-rated. The popular \"21 days\" figure has no good evidence behind it. The study looked at single missed days, not long gaps — restart quickly after a slip.",
      zh: "只是一项小研究，“自动化程度”靠自评。流行的“21 天养成习惯”说法没有可靠依据。研究看的是偶尔漏一天，不是长期中断——断了就尽快接上。",
    },
    money: "0", time: "少", will: "些", level: "小", lens: "时间",
  },
  {
    id: "E.13",
    area: "mind",
    title: {
      en: "Get professional help — and start moving — if low mood lasts two weeks or more",
      zh: "情绪低落持续两周以上，去找专业帮助，同时动起来",
    },
    cost: {
      en: "Professional care may cost money; exercise is free; both take effort when you feel low",
      zh: "专业治疗可能要花钱；运动不花钱；情绪低落时两件事都需要咬牙去做",
    },
    human: {
      en: "Feeling down most of the day, nearly every day, for two weeks or more can be depression, and depression is treatable. In trials, walking or jogging, yoga and strength training eased depression moderately, more so when done harder — use them alongside professional help, not instead of it. If you have thoughts of harming yourself, call your local emergency number or find a free helpline at https://findahelpline.com.",
      zh: "如果几乎每天、大半天都情绪低落，持续两周以上，可能是抑郁，而抑郁是可以治疗的。研究显示，走路或慢跑、瑜伽和力量训练都能中等程度地减轻抑郁，强度越大效果越好——但要和专业治疗一起用，不能替代它。如果有伤害自己的念头，请拨打当地急救电话，或在 https://findahelpline.com 找免费求助热线。",
    },
    gain: {
      en: "WHO: a depressive episode lasts most of the day, nearly every day, for at least two weeks; effective treatments include psychological treatment and medicines. Noetel 2024 network meta-analysis (218 RCTs, 14,170 participants meeting clinical cut-offs for major depression), vs active controls: walking or jogging Hedges' g −0.62 (95% credible interval −0.80 to −0.45), yoga −0.55 (−0.73 to −0.36), strength training −0.49 (−0.69 to −0.29), mixed aerobic −0.43 (−0.61 to −0.24), tai chi or qigong −0.42 (−0.65 to −0.21). Effects were proportional to prescribed intensity; strength training and yoga were the most acceptable.",
      zh: "世卫组织：抑郁发作表现为几乎每天、一天中大部分时间情绪低落，持续至少两周；有效治疗包括心理治疗和药物。Noetel 2024 网络荟萃分析（218 项随机对照试验，14,170 名达到重度抑郁临床标准的参与者），与积极对照相比：步行或慢跑 Hedges' g −0.62（95% 可信区间 −0.80 至 −0.45），瑜伽 −0.55（−0.73 至 −0.36），力量训练 −0.49（−0.69 至 −0.29），混合有氧 −0.43（−0.61 至 −0.24），太极或气功 −0.42（−0.65 至 −0.21）。效果与处方强度成正比；力量训练和瑜伽的接受度最高。",
    },
    grade: "A",
    src: "Noetel M, et al. (2024). Effect of exercise for depression: systematic review and network meta-analysis of randomised controlled trials. BMJ. https://doi.org/10.1136/bmj-2023-075847 ; World Health Organization (2026). Depression (fact sheet). https://www.who.int/news-room/fact-sheets/detail/depression ; Find A Helpline (ThroughLine). Free, confidential helplines in 175+ countries. https://findahelpline.com",
    note: {
      en: "Confidence in the exercise results was rated low for walking or jogging and very low for the others; only one trial was at low risk of bias. Exercise is a complement to assessment and care, not a replacement. In a crisis, use https://findahelpline.com or your local emergency number.",
      zh: "运动效果的证据可信度：步行或慢跑为“低”，其余为“很低”；只有一项试验的偏倚风险低。运动是专业评估和治疗的补充，而不是替代。遇到危机，请上 https://findahelpline.com 或拨打当地急救电话。",
    },
    money: "少", time: "中", will: "是", level: "中", lens: "死亡率",
  },
  {
    id: "E.14",
    area: "connect",
    title: {
      en: "Keep a few relationships where you can really talk",
      zh: "保持几段能说真心话的关系",
    },
    cost: {
      en: "Free; a few hours a week; takes effort to reach out",
      zh: "不花钱；每周几小时；需要主动联系",
    },
    human: {
      en: "Across 148 studies, people with stronger social ties were about 50% more likely to still be alive at follow-up — an effect comparable to well-known health risks. Just living with someone showed the weakest link; being broadly woven into other people's lives showed the strongest.",
      zh: "汇总 148 项研究发现，社会关系更紧密的人，在随访期间仍然在世的可能性高出约 50%，影响大小可与公认的健康风险因素相比。只是和别人住在一起，关联最弱；全面融入他人的生活，关联最强。",
    },
    gain: {
      en: "Holt-Lunstad 2010 meta-analysis of 148 studies (308,849 participants): random-effects OR 1.50 (95% CI 1.42–1.59) for survival with stronger social relationships, consistent across age, sex, initial health status, cause of death and follow-up period. Strongest for complex measures of social integration (OR 1.91, 1.63–2.23); weakest for living alone vs with others (OR 1.19, 0.99–1.44). Authors: influence comparable with well-established mortality risk factors.",
      zh: "Holt-Lunstad 2010 对 148 项研究（308,849 人）的荟萃分析：社会关系更强者的存活比值比 OR 1.50（95% CI 1.42–1.59），在年龄、性别、初始健康状况、死因和随访时长各方面都一致。用综合性社会融入指标衡量时关联最强（OR 1.91，1.63–2.23）；用独居与否衡量时最弱（OR 1.19，0.99–1.44）。作者认为其影响可与公认的死亡风险因素相比。",
    },
    grade: "A",
    src: "Holt-Lunstad J, et al. (2010). Social relationships and mortality risk: a meta-analytic review. PLOS Medicine. https://doi.org/10.1371/journal.pmed.1000316",
    note: {
      en: "Observational: healthier people may find it easier to stay connected, so not all of the link is cause and effect. The measures were broad, not specifically about close confiding relationships.",
      zh: "这是观察性研究：身体更好的人本来就更容易维持社交，所以关联不全是因果。研究用的指标比较宽泛，并非专门衡量能说心里话的亲密关系。",
    },
    money: "0", time: "中", will: "些", level: "大", lens: "死亡率",
  },
  {
    id: "E.15",
    area: "work",
    title: {
      en: "Look about 6 metres away for 20 seconds, every 20 minutes at a screen",
      zh: "每看屏幕 20 分钟，望向约 6 米外 20 秒",
    },
    cost: {
      en: "Free; seconds at a time; a reminder app helps",
      zh: "不花钱；每次几十秒；用提醒软件更容易坚持",
    },
    human: {
      en: "Regular look-away breaks eased tired, dry, strained eyes in a small two-week study, but the relief faded within a week of stopping. Screen time can make your eyes tired, but eye strain does not cause permanent damage.",
      zh: "一项为期两周的小研究发现，定时远眺能缓解眼睛疲劳、干涩，但停下来一周后效果就没了。看屏幕会让眼睛累，但眼疲劳不会造成永久损伤。",
    },
    gain: {
      en: "Talens-Estarelles 2023, uncontrolled before–after study, 29 symptomatic computer users, 2 weeks of webcam-based 20-20-20 reminders: breaks per day increased (p≤0.015); digital eye strain and dry-eye symptoms decreased (p≤0.045) but the improvement was not maintained 1 week after stopping (p>0.05); no change in ocular surface or tear-film signs (p≥0.089) or binocular vision except accommodative facility (p=0.010). AAO: 'Every 20 minutes, shift your eyes to look at an object at least 20 feet away, for at least 20 seconds'; eye strain 'does not cause permanent damage'.",
      zh: "Talens-Estarelles 2023，无对照的前后对比研究，29 名有症状的电脑使用者，用摄像头软件按 20-20-20 规则提醒 2 周：每天休息次数增加（p≤0.015）；数码眼疲劳和干眼症状减轻（p≤0.045），但停用 1 周后改善消失（p>0.05）；眼表和泪膜指标无变化（p≥0.089），双眼视功能除调节灵活度（p=0.010）外无变化。美国眼科学会：“每 20 分钟，把视线移向至少 20 英尺（约 6 米）外的物体，至少 20 秒”；眼疲劳“不会造成永久损伤”。",
    },
    grade: "B",
    src: "Talens-Estarelles C, et al. (2023). The effects of breaks on digital eye strain, dry eye and binocular vision: testing the 20-20-20 rule. Contact Lens and Anterior Eye. https://doi.org/10.1016/j.clae.2022.101744 ; American Academy of Ophthalmology (2023). Eye strain and sleepy eyes: how to prevent eye discomfort. https://www.aao.org/eye-health/diseases/what-is-eye-strain ; American Academy of Ophthalmology (2024). Computers, digital devices, and eye strain. https://www.aao.org/eye-health/tips-prevention/computer-usage",
    note: {
      en: "Weak evidence: one small study with no comparison group, and only symptoms improved. Other expert tips: blink more often, use artificial tears when your eyes feel dry, and keep the screen about an arm's length away. See an eye doctor if discomfort persists or vision changes.",
      zh: "证据较弱：只有一项没有对照组的小研究，而且只改善了主观症状。其他专家建议：多眨眼，眼睛干时用人工泪液，屏幕离眼睛约一臂远。如果不适持续或视力有变化，请看眼科医生。",
    },
    money: "0", time: "少", will: "些", level: "小", lens: "时间",
  },
]
