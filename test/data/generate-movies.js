const fs = require('fs');
const path = require('path');

// 真实存在的电影、电视剧和动画片数据
const moviesData = {
  movies: [
    {
      title: "流浪地球",
      year: "2019",
      studio: "中国电影",
      director: "郭帆",
      description: "太阳即将毁灭，人类启动流浪地球计划，带着地球逃离太阳系",
      tags: ["sci-fi", "action"],
      actors: ["吴京", "屈楚萧", "李光洁", "吴孟达"]
    },
    {
      title: "战狼2",
      year: "2017",
      studio: "春秋时代",
      director: "吴京",
      description: "中国特种兵在海外执行任务，保护同胞安全",
      tags: ["action", "war"],
      actors: ["吴京", "弗兰克·格里罗", "吴刚", "卢靖姗"]
    },
    {
      title: "红海行动",
      year: "2018",
      studio: "博纳影业",
      director: "林超贤",
      description: "中国海军陆战队执行撤侨任务",
      tags: ["action", "war"],
      actors: ["张译", "黄景瑜", "海清", "杜江"]
    },
    {
      title: "哪吒之魔童降世",
      year: "2019",
      studio: "彩条屋影业",
      director: "饺子",
      description: "哪吒逆天而行，反抗命运的故事",
      tags: ["animation", "fantasy"],
      actors: ["吕艳婷", "囧森瑟夫", "瀚墨", "陈浩"]
    },
    {
      title: "唐人街探案",
      year: "2015",
      studio: "万达影视",
      director: "陈思诚",
      description: "天赋异禀的结巴少年和精于偷窃的猥琐大叔在泰国破案",
      tags: ["comedy", "crime"],
      actors: ["王宝强", "刘昊然", "陈赫", "佟丽娅"]
    },
    {
      title: "我不是药神",
      year: "2018",
      studio: "坏猴子影业",
      director: "文牧野",
      description: "普通人从印度代购抗癌药物，救助白血病患者的真实故事改编",
      tags: ["drama", "realistic"],
      actors: ["徐峥", "周一围", "王传君", "谭卓"]
    },
    {
      title: "你好，李焕英",
      year: "2021",
      studio: "新丽传媒",
      director: "贾玲",
      description: "女儿穿越时空回到过去，与年轻时的母亲相遇的故事",
      tags: ["comedy", "drama", "family"],
      actors: ["贾玲", "张小斐", "沈腾", "陈赫"]
    },
    {
      title: "满江红",
      year: "2023",
      studio: "欢喜传媒",
      director: "张艺谋",
      description: "南宋时期一群义士寻找岳飞遗作的故事",
      tags: ["history", "drama"],
      actors: ["沈腾", "易烊千玺", "张译", "雷佳音"]
    },
    {
      title: "封神第一部",
      year: "2023",
      studio: "北京文化",
      director: "乌尔善",
      description: "商王殷寿与狐妖妲己勾结，姜子牙携封神榜下山寻找天下共主",
      tags: ["fantasy", "history"],
      actors: ["费翔", "李雪健", "黄渤", "于适"]
    },
    {
      title: "长津湖",
      year: "2021",
      studio: "博纳影业",
      director: "陈凯歌",
      description: "抗美援朝战争中长津湖战役的真实历史",
      tags: ["war", "history"],
      actors: ["吴京", "易烊千玺", "段奕宏", "朱亚文"]
    },
    {
      title: "八佰",
      year: "2020",
      studio: "华谊兄弟",
      director: "管虎",
      description: "1937年淞沪会战末期，四行仓库保卫战",
      tags: ["war", "history"],
      actors: ["张译", "姜武", "王千源", "黄志忠"]
    },
    {
      title: "我和我的祖国",
      year: "2019",
      studio: "华夏电影",
      director: "陈凯歌",
      description: "七个故事讲述新中国成立70年来的重要历史瞬间",
      tags: ["drama", "history"],
      actors: ["黄渤", "张译", "吴京", "葛优"]
    },
    {
      title: "少年的你",
      year: "2019",
      studio: "青春光线",
      director: "曾国祥",
      description: "校园霸凌背景下两个少年的成长故事",
      tags: ["drama", "youth"],
      actors: ["周冬雨", "易烊千玺", "尹昉", "黄觉"]
    },
    {
      title: "刺杀小说家",
      year: "2021",
      studio: "华策影视",
      director: "路阳",
      description: "现实与小说世界交织的奇幻故事",
      tags: ["fantasy", "action"],
      actors: ["雷佳音", "杨幂", "董子健", "于和伟"]
    },
    {
      title: "万里归途",
      year: "2022",
      studio: "华策影视",
      director: "饶晓志",
      description: "外交官撤侨的真实故事改编",
      tags: ["drama", "war"],
      actors: ["张译", "王俊凯", "殷桃", "成泰燊"]
    },
    {
      title: "人生大事",
      year: "2022",
      studio: "联瑞影业",
      director: "刘江江",
      description: "殡葬师与孤儿之间的温情故事",
      tags: ["drama", "family"],
      actors: ["朱一龙", "杨恩又", "王戈", "刘陆"]
    },
    {
      title: "独行月球",
      year: "2022",
      studio: "开心麻花",
      director: "张吃鱼",
      description: "维修工意外被遗落在月球，独自生存的故事",
      tags: ["comedy", "sci-fi"],
      actors: ["沈腾", "马丽", "常远", "李成儒"]
    },
    {
      title: "热烈",
      year: "2023",
      studio: "大鹏工作室",
      director: "大鹏",
      description: "街舞少年追逐梦想的故事",
      tags: ["dance", "youth"],
      actors: ["黄渤", "王一博", "刘敏涛", "小沈阳"]
    },
    {
      title: "消失的她",
      year: "2023",
      studio: "壹同制作",
      director: "崔睿",
      description: "妻子在旅行中离奇失踪，丈夫寻找真相",
      tags: ["suspense", "crime"],
      actors: ["朱一龙", "倪妮", "文咏珊", "杜江"]
    },
    {
      title: "孤注一掷",
      year: "2023",
      studio: "坏猴子影业",
      director: "申奥",
      description: "网络诈骗题材电影，揭露境外诈骗产业链",
      tags: ["crime", "suspense"],
      actors: ["张艺兴", "金晨", "咏梅", "王传君"]
    },
    {
      title: "热辣滚烫",
      year: "2024",
      studio: "新丽传媒",
      director: "贾玲",
      description: "宅女通过拳击实现自我蜕变",
      tags: ["comedy", "drama"],
      actors: ["贾玲", "雷佳音", "张小斐", "杨紫"]
    },
    {
      title: "飞驰人生2",
      year: "2024",
      studio: "开心麻花",
      director: "韩寒",
      description: "赛车手重返赛场追求梦想",
      tags: ["comedy", "sports"],
      actors: ["沈腾", "范丞丞", "尹正", "张本煜"]
    },
    {
      title: "飞驰人生",
      year: "2019",
      studio: "开心麻花",
      director: "韩寒",
      description: "赛车手张驰重返赛场的故事",
      tags: ["comedy", "sports"],
      actors: ["沈腾", "黄景瑜", "尹正", "张本煜"]
    },
    {
      title: "西虹市首富",
      year: "2018",
      studio: "开心麻花",
      director: "闫非",
      description: "穷小子继承巨额遗产的故事",
      tags: ["comedy", "family"],
      actors: ["沈腾", "宋芸桦", "张一鸣", "常远"]
    },
    {
      title: "羞羞的铁拳",
      year: "2017",
      studio: "开心麻花",
      director: "宋阳",
      description: "男女身体互换后的搞笑故事",
      tags: ["comedy", "sports"],
      actors: ["马丽", "艾伦", "沈腾", "田雨"]
    },
    {
      title: "夏洛特烦恼",
      year: "2015",
      studio: "开心麻花",
      director: "闫非",
      description: "夏洛穿越回到高中时代的故事",
      tags: ["comedy", "youth"],
      actors: ["沈腾", "马丽", "尹正", "艾伦"]
    },
    {
      title: "这个杀手不太冷静",
      year: "2022",
      studio: "开心麻花",
      director: "邢文雄",
      description: "群演被误认为杀手的故事",
      tags: ["comedy", "crime"],
      actors: ["马丽", "魏翔", "陈明昊", "周大勇"]
    },
    {
      title: "李茶的姑妈",
      year: "2018",
      studio: "开心麻花",
      director: "吴昱翰",
      description: "真假姑妈引发的搞笑故事",
      tags: ["comedy", "family"],
      actors: ["黄才伦", "艾伦", "宋阳", "卢靖姗"]
    },
    {
      title: "我和我的家乡",
      year: "2020",
      studio: "中国电影",
      director: "宁浩",
      description: "五个故事讲述家乡的变化",
      tags: ["drama", "comedy"],
      actors: ["葛优", "黄渤", "范伟", "邓超"]
    },
    {
      title: "我和我的父辈",
      year: "2021",
      studio: "中国电影",
      director: "吴京",
      description: "四个时代的父辈故事",
      tags: ["drama", "history"],
      actors: ["吴京", "章子怡", "徐峥", "沈腾"]
    },
    {
      title: "万里归途",
      year: "2022",
      studio: "华策影视",
      director: "饶晓志",
      description: "外交官撤侨的真实故事改编",
      tags: ["drama", "war"],
      actors: ["张译", "王俊凯", "殷桃", "成泰燊"]
    },
    {
      title: "中国医生",
      year: "2021",
      studio: "博纳影业",
      director: "刘伟强",
      description: "武汉抗疫期间的医生故事",
      tags: ["drama", "realistic"],
      actors: ["张涵予", "袁泉", "朱亚文", "李晨"]
    },
    {
      title: "中国机长",
      year: "2019",
      studio: "博纳影业",
      director: "刘伟强",
      description: "川航8633航班备降的真实事件",
      tags: ["drama", "action"],
      actors: ["张涵予", "欧豪", "杜江", "袁泉"]
    },
    {
      title: "烈火英雄",
      year: "2019",
      studio: "博纳影业",
      director: "陈国辉",
      description: "消防员扑灭油罐火灾的故事",
      tags: ["action", "drama"],
      actors: ["黄晓明", "杜江", "谭卓", "杨紫"]
    },
    {
      title: "攀登者",
      year: "2019",
      studio: "华谊兄弟",
      director: "李仁港",
      description: "中国登山队攀登珠穆朗玛峰",
      tags: ["adventure", "drama"],
      actors: ["吴京", "章子怡", "张译", "井柏然"]
    },
    {
      title: "夺冠",
      year: "2020",
      studio: "我们制作",
      director: "陈可辛",
      description: "中国女排的奋斗历程",
      tags: ["sports", "drama"],
      actors: ["巩俐", "黄渤", "吴刚", "彭昱畅"]
    },
    {
      title: "一点就到家",
      year: "2020",
      studio: "中国电影",
      director: "许宏宇",
      description: "三个年轻人在云南创业的故事",
      tags: ["comedy", "youth"],
      actors: ["刘昊然", "彭昱畅", "尹昉", "姜珮瑶"]
    },
    {
      title: "温暖的抱抱",
      year: "2020",
      studio: "开心麻花",
      director: "常远",
      description: "强迫症患者的治愈之旅",
      tags: ["comedy", "drama"],
      actors: ["常远", "李沁", "沈腾", "乔杉"]
    },
    {
      title: "沐浴之王",
      year: "2020",
      studio: "易小星工作室",
      director: "易小星",
      description: "搓澡技艺的传承故事",
      tags: ["comedy", "family"],
      actors: ["彭昱畅", "乔杉", "卜冠今", "苇青"]
    },
    {
      title: "唐人街探案2",
      year: "2018",
      studio: "万达影视",
      director: "陈思诚",
      description: "唐仁和秦风在纽约破案的故事",
      tags: ["comedy", "crime"],
      actors: ["王宝强", "刘昊然", "肖央", "刘承羽"]
    },
    {
      title: "唐人街探案3",
      year: "2021",
      studio: "万达影视",
      director: "陈思诚",
      description: "唐仁和秦风在东京破案的故事",
      tags: ["comedy", "crime"],
      actors: ["王宝强", "刘昊然", "妻夫木聪", "托尼·贾"]
    },
    {
      title: "误杀",
      year: "2019",
      studio: "卓然影业",
      director: "柯汶利",
      description: "父亲为保护家人而掩盖真相",
      tags: ["crime", "suspense"],
      actors: ["肖央", "谭卓", "陈冲", "姜皓文"]
    },
    {
      title: "误杀2",
      year: "2021",
      studio: "卓然影业",
      director: "戴墨",
      description: "父亲为救儿子而铤而走险",
      tags: ["crime", "drama"],
      actors: ["肖央", "任达华", "文咏珊", "张颂文"]
    },
    {
      title: "人潮汹涌",
      year: "2021",
      studio: "饶晓志工作室",
      director: "饶晓志",
      description: "杀手和群演互换人生的故事",
      tags: ["comedy", "crime"],
      actors: ["刘德华", "肖央", "万茜", "程怡"]
    },
    {
      title: "无名",
      year: "2023",
      studio: "博纳影业",
      director: "程耳",
      description: "抗日战争时期地下工作者的故事",
      tags: ["history", "suspense"],
      actors: ["梁朝伟", "王一博", "周迅", "黄磊"]
    },
    {
      title: "流浪地球2",
      year: "2023",
      studio: "中国电影",
      director: "郭帆",
      description: "太阳危机前的全球救援行动",
      tags: ["sci-fi", "action"],
      actors: ["吴京", "刘德华", "李雪健", "沙溢"]
    },
    {
      title: "满城尽带黄金甲",
      year: "2006",
      studio: "新画面影业",
      director: "张艺谋",
      description: "宫廷权谋与家族恩怨的故事",
      tags: ["costume", "drama"],
      actors: ["周润发", "巩俐", "周杰伦", "刘烨"]
    },
    {
      title: "英雄",
      year: "2002",
      studio: "新画面影业",
      director: "张艺谋",
      description: "刺客刺秦王的故事",
      tags: ["action", "history"],
      actors: ["李连杰", "梁朝伟", "张曼玉", "章子怡"]
    },
    {
      title: "十面埋伏",
      year: "2004",
      studio: "新画面影业",
      director: "张艺谋",
      description: "唐朝捕快与飞刀门的故事",
      tags: ["action", "costume"],
      actors: ["刘德华", "章子怡", "金城武", "宋丹丹"]
    },
    {
      title: "影",
      year: "2018",
      studio: "乐视影业",
      director: "张艺谋",
      description: "替身与真身的权谋故事",
      tags: ["action", "costume"],
      actors: ["邓超", "孙俪", "郑恺", "王千源"]
    },
    {
      title: "悬崖之上",
      year: "2021",
      studio: "中国电影",
      director: "张艺谋",
      description: "特工在哈尔滨执行任务的故事",
      tags: ["suspense", "history"],
      actors: ["张译", "于和伟", "秦海璐", "朱亚文"]
    },
    {
      title: "一秒钟",
      year: "2020",
      studio: "欢喜传媒",
      director: "张艺谋",
      description: "劳改犯为看女儿电影而逃亡的故事",
      tags: ["drama", "history"],
      actors: ["张译", "刘浩存", "范伟", "于和伟"]
    },
    {
      title: "狙击手",
      year: "2022",
      studio: "中国电影",
      director: "张艺谋",
      description: "抗美援朝战场上的狙击对决",
      tags: ["war", "action"],
      actors: ["陈永胜", "章宇", "张译", "柯蓝"]
    },
    {
      title: "满江红",
      year: "2023",
      studio: "欢喜传媒",
      director: "张艺谋",
      description: "南宋时期寻找岳飞遗作的故事",
      tags: ["history", "drama"],
      actors: ["沈腾", "易烊千玺", "张译", "雷佳音"]
    },
    {
      title: "让子弹飞",
      year: "2010",
      studio: "不亦乐乎",
      director: "姜文",
      description: "张牧之与黄四郎斗智斗勇",
      tags: ["comedy", "action"],
      actors: ["姜文", "葛优", "周润发", "刘嘉玲"]
    },
    {
      title: "一步之遥",
      year: "2014",
      studio: "不亦乐乎",
      director: "姜文",
      description: "民国时期的选美大赛与阴谋",
      tags: ["comedy", "drama"],
      actors: ["姜文", "葛优", "周韵", "舒淇"]
    },
    {
      title: "邪不压正",
      year: "2018",
      studio: "不亦乐乎",
      director: "姜文",
      description: "李天然复仇的故事",
      tags: ["action", "history"],
      actors: ["彭于晏", "姜文", "廖凡", "周韵"]
    },
    {
      title: "鬼子来了",
      year: "2000",
      studio: "华谊兄弟",
      director: "姜文",
      description: "抗战时期村民与日本俘虏的故事",
      tags: ["drama", "history"],
      actors: ["姜文", "姜鸿波", "陈强", "陈述"]
    },
    {
      title: "阳光灿烂的日子",
      year: "1994",
      studio: "中国电影",
      director: "姜文",
      description: "文革时期北京少年马小军的故事",
      tags: ["drama", "youth"],
      actors: ["夏雨", "宁静", "陶虹", "耿乐"]
    },
    {
      title: "太阳照常升起",
      year: "2007",
      studio: "不亦乐乎",
      director: "姜文",
      description: "四个时空交织的魔幻故事",
      tags: ["drama", "fantasy"],
      actors: ["房祖名", "周韵", "姜文", "黄秋生"]
    },
    {
      title: "集结号",
      year: "2007",
      studio: "华谊兄弟",
      director: "冯小刚",
      description: "连长谷子地为战友正名的故事",
      tags: ["war", "drama"],
      actors: ["张涵予", "邓超", "袁文康", "汤嬿"]
    },
    {
      title: "唐山大地震",
      year: "2010",
      studio: "华谊兄弟",
      director: "冯小刚",
      description: "地震中家庭的离散与重逢",
      tags: ["drama", "disaster"],
      actors: ["徐帆", "张静初", "李晨", "陈道明"]
    },
    {
      title: "一九四二",
      year: "2012",
      studio: "华谊兄弟",
      director: "冯小刚",
      description: "河南大饥荒的真实历史",
      tags: ["drama", "history"],
      actors: ["张国立", "陈道明", "徐帆", "张涵予"]
    },
    {
      title: "芳华",
      year: "2017",
      studio: "华谊兄弟",
      director: "冯小刚",
      description: "文工团青年的青春故事",
      tags: ["drama", "youth"],
      actors: ["黄轩", "苗苗", "钟楚曦", "杨采钰"]
    },
    {
      title: "非诚勿扰",
      year: "2008",
      studio: "华谊兄弟",
      director: "冯小刚",
      description: "秦奋的征婚之旅",
      tags: ["comedy", "romance"],
      actors: ["葛优", "舒淇", "范伟", "方中信"]
    },
    {
      title: "非诚勿扰2",
      year: "2010",
      studio: "华谊兄弟",
      director: "冯小刚",
      description: "秦奋与笑笑的情感故事",
      tags: ["comedy", "romance"],
      actors: ["葛优", "舒淇", "孙红雷", "姚晨"]
    },
    {
      title: "私人订制",
      year: "2013",
      studio: "华谊兄弟",
      director: "冯小刚",
      description: "梦想定制公司的故事",
      tags: ["comedy", "drama"],
      actors: ["葛优", "白百何", "李小璐", "郑恺"]
    },
    {
      title: "天下无贼",
      year: "2004",
      studio: "华谊兄弟",
      director: "冯小刚",
      description: "贼夫妻保护傻根的故事",
      tags: ["crime", "drama"],
      actors: ["刘德华", "刘若英", "葛优", "王宝强"]
    },
    {
      title: "夜宴",
      year: "2006",
      studio: "华谊兄弟",
      director: "冯小刚",
      description: "宫廷权谋与爱情悲剧",
      tags: ["costume", "drama"],
      actors: ["章子怡", "葛优", "吴彦祖", "周迅"]
    },
    {
      title: "甲方乙方",
      year: "1997",
      studio: "中国电影",
      director: "冯小刚",
      description: "好梦一日游公司的故事",
      tags: ["comedy", "drama"],
      actors: ["葛优", "刘蓓", "何冰", "傅彪"]
    },
    {
      title: "不见不散",
      year: "1998",
      studio: "中国电影",
      director: "冯小刚",
      description: "刘元和李清在洛杉矶的爱情故事",
      tags: ["comedy", "romance"],
      actors: ["葛优", "徐帆", "李明", "杜功海"]
    },
    {
      title: "没完没了",
      year: "1999",
      studio: "中国电影",
      director: "冯小刚",
      description: "韩冬绑架阮大伟女友的故事",
      tags: ["comedy", "drama"],
      actors: ["葛优", "吴倩莲", "傅彪", "徐帆"]
    },
    {
      title: "大腕",
      year: "2001",
      studio: "华谊兄弟",
      director: "冯小刚",
      description: "葬礼策划引发的故事",
      tags: ["comedy", "drama"],
      actors: ["葛优", "关之琳", "英达", "保罗·克塞"]
    },
    {
      title: "手机",
      year: "2003",
      studio: "华谊兄弟",
      director: "冯小刚",
      description: "手机引发的情感危机",
      tags: ["drama", "comedy"],
      actors: ["葛优", "徐帆", "张国立", "范冰冰"]
    },
    {
      title: "老炮儿",
      year: "2015",
      studio: "华谊兄弟",
      director: "管虎",
      description: "老北京混混的时代变迁",
      tags: ["drama", "action"],
      actors: ["冯小刚", "张涵予", "许晴", "李易峰"]
    },
    {
      title: "老炮儿2",
      year: "2024",
      studio: "华谊兄弟",
      director: "管虎",
      description: "六爷后人的江湖故事",
      tags: ["drama", "action"],
      actors: ["张涵予", "陈伟霆", "李易峰", "管虎"]
    },
    {
      title: "金刚川",
      year: "2020",
      studio: "中国电影",
      director: "管虎",
      description: "抗美援朝战争中架桥的故事",
      tags: ["war", "history"],
      actors: ["张译", "吴京", "李九霄", "魏晨"]
    },
    {
      title: "狗阵",
      year: "2024",
      studio: "七印象",
      director: "管虎",
      description: "西北小镇上人与狗的故事",
      tags: ["drama", "realistic"],
      actors: ["彭于晏", "佟丽娅", "贾樟柯", "周游"]
    },
    {
      title: "革命者",
      year: "2021",
      studio: "博纳影业",
      director: "徐展雄",
      description: "李大钊的革命生涯",
      tags: ["history", "drama"],
      actors: ["张颂文", "李易峰", "佟丽娅", "彭昱畅"]
    },
    {
      title: "1921",
      year: "2021",
      studio: "腾讯影业",
      director: "黄建新",
      description: "中国共产党成立的故事",
      tags: ["history", "drama"],
      actors: ["黄轩", "倪妮", "王仁君", "刘昊然"]
    },
    {
      title: "建党伟业",
      year: "2011",
      studio: "中国电影",
      director: "韩三平",
      description: "从辛亥革命到中共建党的历史",
      tags: ["history", "drama"],
      actors: ["刘烨", "陈坤", "张嘉译", "李沁"]
    },
    {
      title: "建国大业",
      year: "2009",
      studio: "中国电影",
      director: "韩三平",
      description: "新中国成立的历史进程",
      tags: ["history", "drama"],
      actors: ["唐国强", "张国立", "许晴", "刘劲"]
    },
    {
      title: "建军大业",
      year: "2017",
      studio: "中国电影",
      director: "刘伟强",
      description: "人民军队的创建历程",
      tags: ["war", "history"],
      actors: ["刘烨", "朱亚文", "黄志忠", "王景春"]
    },
    {
      title: "湄公河行动",
      year: "2016",
      studio: "博纳影业",
      director: "林超贤",
      description: "中国警察跨境缉毒的故事",
      tags: ["action", "crime"],
      actors: ["张涵予", "彭于晏", "孙淳", "陈宝国"]
    },
    {
      title: "破·局",
      year: "2017",
      studio: "博纳影业",
      director: "李天柱",
      description: "富豪家族的权谋斗争",
      tags: ["crime", "suspense"],
      actors: ["郭富城", "王千源", "王景春", "任达华"]
    },
    {
      title: "寒战",
      year: "2012",
      studio: "银都机构",
      director: "梁乐民",
      description: "香港警队内部的权力斗争",
      tags: ["crime", "suspense"],
      actors: ["郭富城", "梁家辉", "李治廷", "彭于晏"]
    },
    {
      title: "寒战2",
      year: "2016",
      studio: "银都机构",
      director: "梁乐民",
      description: "刘杰辉继续追查真相",
      tags: ["crime", "suspense"],
      actors: ["郭富城", "梁家辉", "周润发", "彭于晏"]
    },
    {
      title: "扫毒",
      year: "2013",
      studio: "博纳影业",
      director: "陈木胜",
      description: "三兄弟与毒枭的较量",
      tags: ["action", "crime"],
      actors: ["刘青云", "古天乐", "张家辉", "袁泉"]
    },
    {
      title: "扫毒2：天地对决",
      year: "2019",
      studio: "博纳影业",
      director: "邱礼涛",
      description: "毒品交易引发的恩怨情仇",
      tags: ["action", "crime"],
      actors: ["刘德华", "古天乐", "苗侨伟", "林嘉欣"]
    },
    {
      title: "拆弹专家",
      year: "2017",
      studio: "博纳影业",
      director: "邱礼涛",
      description: "拆弹专家与恐怖分子的对决",
      tags: ["action", "suspense"],
      actors: ["刘德华", "姜武", "宋佳", "吴卓羲"]
    },
    {
      title: "拆弹专家2",
      year: "2020",
      studio: "博纳影业",
      director: "邱礼涛",
      description: "潘乘风失去记忆后的故事",
      tags: ["action", "suspense"],
      actors: ["刘德华", "刘青云", "倪妮", "谢君豪"]
    },
    {
      title: "怒火·重案",
      year: "2021",
      studio: "英皇电影",
      director: "陈木胜",
      description: "警察与悍匪的正邪对决",
      tags: ["action", "crime"],
      actors: ["甄子丹", "谢霆锋", "秦岚", "谭耀文"]
    },
    {
      title: "追龙",
      year: "2017",
      studio: "博纳影业",
      director: "王晶",
      description: "跛豪与雷洛的黑白故事",
      tags: ["crime", "history"],
      actors: ["甄子丹", "刘德华", "姜皓文", "惠英红"]
    },
    {
      title: "追龙2",
      year: "2019",
      studio: "博纳影业",
      director: "王晶",
      description: "世纪悍匪张子强的故事",
      tags: ["crime", "history"],
      actors: ["古天乐", "梁家辉", "林家栋", "任达华"]
    },
    {
      title: "叶问",
      year: "2008",
      studio: "东方电影",
      director: "叶伟信",
      description: "咏春宗师叶问的故事",
      tags: ["action", "history"],
      actors: ["甄子丹", "任达华", "熊黛林", "樊少皇"]
    },
    {
      title: "叶问2",
      year: "2010",
      studio: "东方电影",
      director: "叶伟信",
      description: "叶问在香港开馆授徒",
      tags: ["action", "history"],
      actors: ["甄子丹", "洪金宝", "熊黛林", "黄晓明"]
    },
    {
      title: "叶问3",
      year: "2015",
      studio: "东方电影",
      director: "叶伟信",
      description: "叶问面对人生重大抉择",
      tags: ["action", "history"],
      actors: ["甄子丹", "张晋", "熊黛林", "谭耀文"]
    },
    {
      title: "叶问4：完结篇",
      year: "2019",
      studio: "东方电影",
      director: "叶伟信",
      description: "叶问最后一战",
      tags: ["action", "history"],
      actors: ["甄子丹", "吴樾", "吴建豪", "斯科特·阿金斯"]
    },
    {
      title: "杀破狼",
      year: "2005",
      studio: "银都机构",
      director: "叶伟信",
      description: "警察与黑帮的殊死搏斗",
      tags: ["action", "crime"],
      actors: ["甄子丹", "吴京", "任达华", "洪金宝"]
    },
    {
      title: "杀破狼2",
      year: "2015",
      studio: "银都机构",
      director: "郑保瑞",
      description: "卧底警察的生死危机",
      tags: ["action", "crime"],
      actors: ["吴京", "托尼·贾", "张晋", "任达华"]
    },
    {
      title: "杀破狼·贪狼",
      year: "2017",
      studio: "银都机构",
      director: "叶伟信",
      description: "警察跨国寻女的故事",
      tags: ["action", "crime"],
      actors: ["古天乐", "吴樾", "林家栋", "克里斯·柯林斯"]
    },
    {
      title: "导火线",
      year: "2007",
      studio: "博纳影业",
      director: "叶伟信",
      description: "卧底警察搜集犯罪证据",
      tags: ["action", "crime"],
      actors: ["甄子丹", "古天乐", "范冰冰", "邹兆龙"]
    },
    {
      title: "龙虎门",
      year: "2006",
      studio: "东方电影",
      director: "叶伟信",
      description: "龙虎门弟子与黑帮斗争",
      tags: ["action", "fantasy"],
      actors: ["甄子丹", "谢霆锋", "余文乐", "董洁"]
    },
    {
      title: "十月围城",
      year: "2009",
      studio: "博纳影业",
      director: "陈德森",
      description: "保护孙中山的故事",
      tags: ["history", "action"],
      actors: ["甄子丹", "谢霆锋", "王学圻", "梁家辉"]
    },
    {
      title: "一个人的武林",
      year: "2014",
      studio: "英皇电影",
      director: "陈德森",
      description: "退役警察与武术狂人的对决",
      tags: ["action", "crime"],
      actors: ["甄子丹", "王宝强", "白百何", "杨采妮"]
    },
    {
      title: "悟空传",
      year: "2017",
      studio: "新丽传媒",
      director: "郭子健",
      description: "孙悟空大闹天宫的故事",
      tags: ["fantasy", "action"],
      actors: ["彭于晏", "倪妮", "余文乐", "俞飞鸿"]
    },
    {
      title: "狄仁杰之通天帝国",
      year: "2010",
      studio: "华谊兄弟",
      director: "徐克",
      description: "狄仁杰侦破皇宫奇案",
      tags: ["costume", "suspense"],
      actors: ["刘德华", "刘嘉玲", "李冰冰", "邓超"]
    },
    {
      title: "狄仁杰之神都龙王",
      year: "2013",
      studio: "华谊兄弟",
      director: "徐克",
      description: "狄仁杰侦破龙王案",
      tags: ["costume", "fantasy"],
      actors: ["赵又廷", "冯绍峰", "林更新", "刘嘉玲"]
    },
    {
      title: "狄仁杰之四大天王",
      year: "2018",
      studio: "华谊兄弟",
      director: "徐克",
      description: "狄仁杰破解四大天王之谜",
      tags: ["costume", "fantasy"],
      actors: ["赵又廷", "冯绍峰", "刘嘉玲", "阮经天"]
    },
    {
      title: "龙门飞甲",
      year: "2011",
      studio: "博纳影业",
      director: "徐克",
      description: "江湖侠客与东厂的斗争",
      tags: ["action", "costume"],
      actors: ["陈坤", "周迅", "李宇春", "桂纶镁"]
    },
    {
      title: "智取威虎山",
      year: "2014",
      studio: "博纳影业",
      director: "徐克",
      description: "解放军剿匪的故事",
      tags: ["war", "action"],
      actors: ["张涵予", "梁家辉", "林更新", "佟丽娅"]
    },
    {
      title: "奇门遁甲",
      year: "2017",
      studio: "博纳影业",
      director: "袁和平",
      description: "江湖奇侠与神秘组织的故事",
      tags: ["fantasy", "action"],
      actors: ["大鹏", "倪妮", "李治廷", "周冬雨"]
    },
    {
      title: "七剑",
      year: "2005",
      studio: "博纳影业",
      director: "徐克",
      description: "七位剑客拯救苍生的故事",
      tags: ["action", "costume"],
      actors: ["甄子丹", "黎明", "杨采妮", "陆毅"]
    },
    {
      title: "倩女幽魂",
      year: "1987",
      studio: "新艺城",
      director: "程小东",
      description: "书生与女鬼的爱情故事",
      tags: ["fantasy", "romance"],
      actors: ["张国荣", "王祖贤", "午马", "刘兆铭"]
    },
    {
      title: "青蛇",
      year: "1993",
      studio: "思远影业",
      director: "徐克",
      description: "白蛇与青蛇的人间情缘",
      tags: ["fantasy", "drama"],
      actors: ["张曼玉", "王祖贤", "赵文卓", "吴兴国"]
    },
    {
      title: "笑傲江湖",
      year: "1990",
      studio: "金公主",
      director: "胡金铨",
      description: "令狐冲的江湖冒险",
      tags: ["action", "costume"],
      actors: ["许冠杰", "叶童", "张学友", "张敏"]
    },
    {
      title: "东方不败风云再起",
      year: "1992",
      studio: "金公主",
      director: "李惠民",
      description: "东方不败重出江湖",
      tags: ["action", "costume"],
      actors: ["林青霞", "李连杰", "关之琳", "李嘉欣"]
    },
    {
      title: "新龙门客栈",
      year: "1992",
      studio: "思远影业",
      director: "李惠民",
      description: "大漠客栈中的恩怨情仇",
      tags: ["action", "costume"],
      actors: ["林青霞", "张曼玉", "梁家辉", "甄子丹"]
    },
    {
      title: "黄飞鸿",
      year: "1991",
      studio: "嘉禾",
      director: "徐克",
      description: "黄飞鸿在广州的故事",
      tags: ["action", "history"],
      actors: ["李连杰", "关之琳", "元彪", "张学友"]
    },
    {
      title: "黄飞鸿之二男儿当自强",
      year: "1992",
      studio: "嘉禾",
      director: "徐克",
      description: "黄飞鸿对抗白莲教",
      tags: ["action", "history"],
      actors: ["李连杰", "关之琳", "莫少聪", "甄子丹"]
    },
    {
      title: "黄飞鸿之三狮王争霸",
      year: "1993",
      studio: "嘉禾",
      director: "徐克",
      description: "黄飞鸿参加狮王争霸赛",
      tags: ["action", "history"],
      actors: ["李连杰", "关之琳", "莫少聪", "熊欣欣"]
    },
    {
      title: "精武英雄",
      year: "1994",
      studio: "嘉禾",
      director: "陈嘉上",
      description: "陈真为师报仇的故事",
      tags: ["action", "history"],
      actors: ["李连杰", "中山忍", "钱小豪", "仓田保昭"]
    },
    {
      title: "方世玉",
      year: "1993",
      studio: "嘉禾",
      director: "元奎",
      description: "方世玉的行侠仗义",
      tags: ["action", "comedy"],
      actors: ["李连杰", "萧芳芳", "李嘉欣", "陈松勇"]
    },
    {
      title: "太极张三丰",
      year: "1993",
      studio: "嘉禾",
      director: "袁和平",
      description: "张三丰创立太极拳的故事",
      tags: ["action", "history"],
      actors: ["李连杰", "杨紫琼", "钱小豪", "袁洁莹"]
    },
    {
      title: "倚天屠龙记之魔教教主",
      year: "1993",
      studio: "嘉禾",
      director: "王晶",
      description: "张无忌成长与明教的故事",
      tags: ["action", "costume"],
      actors: ["李连杰", "张敏", "黎姿", "邱淑贞"]
    },
    {
      title: "中南海保镖",
      year: "1994",
      studio: "嘉禾",
      director: "元奎",
      description: "中南海保镖保护证人的故事",
      tags: ["action", "crime"],
      actors: ["李连杰", "钟丽缇", "郑则仕", "邹兆龙"]
    },
    {
      title: "给爸爸的信",
      year: "1995",
      studio: "嘉禾",
      director: "元奎",
      description: "父亲与儿子的感人故事",
      tags: ["action", "family"],
      actors: ["李连杰", "梅艳芳", "谢苗", "于荣光"]
    },
    {
      title: "冒险王",
      year: "1996",
      studio: "嘉禾",
      director: "程小东",
      description: "冒险王寻找圣经的故事",
      tags: ["action", "adventure"],
      actors: ["李连杰", "关之琳", "金城武", "杨采妮"]
    },
    {
      title: "黑侠",
      year: "1996",
      studio: "嘉禾",
      director: "李仁港",
      description: "超级英雄打击犯罪的故事",
      tags: ["action", "sci-fi"],
      actors: ["李连杰", "刘青云", "莫文蔚", "黄秋生"]
    },
    {
      title: "杀手之王",
      year: "1998",
      studio: "嘉禾",
      director: "董玮",
      description: "顶级杀手的故事",
      tags: ["action", "crime"],
      actors: ["李连杰", "任达华", "梁咏琪", "曾志伟"]
    },
    {
      title: "宇宙追缉令",
      year: "2001",
      studio: "新线影业",
      director: "黄毅瑜",
      description: "平行宇宙中的对决",
      tags: ["action", "sci-fi"],
      actors: ["李连杰", "杰森·斯坦森", "卡拉·古奇诺", "德尔罗伊·林多"]
    },
    {
      title: "狼犬丹尼",
      year: "2005",
      studio: "焦点影业",
      director: "路易斯·莱特里尔",
      description: "被训练成杀手的好男人",
      tags: ["action", "drama"],
      actors: ["李连杰", "摩根·弗里曼", "鲍勃·霍斯金斯", "凯瑞·康顿"]
    },
    {
      title: "致命罗密欧",
      year: "2000",
      studio: "华纳兄弟",
      director: "安德烈·巴柯维亚",
      description: "警察为弟弟复仇的故事",
      tags: ["action", "crime"],
      actors: ["李连杰", "艾莉雅", "以赛亚·华盛顿", "亨利·欧"]
    },
    {
      title: "猛虎出笼",
      year: "2005",
      studio: "焦点影业",
      director: "路易斯·莱特里尔",
      description: "被当作武器培养的男人的觉醒",
      tags: ["action", "drama"],
      actors: ["李连杰", "摩根·弗里曼", "鲍勃·霍斯金斯", "凯瑞·康顿"]
    },
    {
      title: "游侠",
      year: "2007",
      studio: "狮门影业",
      director: "菲利普·G·阿特威尔",
      description: "FBI追捕神秘杀手",
      tags: ["action", "crime"],
      actors: ["李连杰", "杰森·斯坦森", "娜迪亚·法尔丝", "路易斯·古兹曼"]
    },
    {
      title: "敢死队",
      year: "2010",
      studio: "狮门影业",
      director: "西尔维斯特·史泰龙",
      description: "雇佣兵团队执行任务",
      tags: ["action", "war"],
      actors: ["西尔维斯特·史泰龙", "杰森·斯坦森", "李连杰", "米基·洛克"]
    },
    {
      title: "敢死队2",
      year: "2012",
      studio: "狮门影业",
      director: "西蒙·韦斯特",
      description: "雇佣兵团队再次出击",
      tags: ["action", "war"],
      actors: ["西尔维斯特·史泰龙", "杰森·斯坦森", "李连杰", "余男"]
    },
    {
      title: "变形金刚4",
      year: "2014",
      studio: "派拉蒙",
      director: "迈克尔·贝",
      description: "机器人与人类的故事",
      tags: ["sci-fi", "action"],
      actors: ["马克·沃尔伯格", "李冰冰", "斯坦利·图齐", "凯尔西·格兰莫"]
    },
    {
      title: "功夫之王",
      year: "2008",
      studio: "狮门影业",
      director: "罗伯·明可夫",
      description: "美国少年穿越到中国学习功夫",
      tags: ["action", "fantasy"],
      actors: ["李连杰", "成龙", "刘亦菲", "迈克尔·安格拉诺"]
    },
    {
      title: "霍元甲",
      year: "2006",
      studio: "中影集团",
      director: "于仁泰",
      description: "霍元甲的一生",
      tags: ["action", "history"],
      actors: ["李连杰", "董勇", "孙俪", "中村狮童"]
    },
    {
      title: "投名状",
      year: "2007",
      studio: "中影集团",
      director: "陈可辛",
      description: "三兄弟的恩怨情仇",
      tags: ["action", "history"],
      actors: ["李连杰", "刘德华", "金城武", "徐静蕾"]
    },
    {
      title: "海洋天堂",
      year: "2010",
      studio: "中国电影",
      director: "薛晓路",
      description: "父亲与孤独症儿子的故事",
      tags: ["drama", "family"],
      actors: ["李连杰", "文章", "高圆圆", "朱媛媛"]
    },
    {
      title: "不二神探",
      year: "2013",
      studio: "博纳影业",
      director: "王子鸣",
      description: "搞笑警察搭档破案",
      tags: ["comedy", "crime"],
      actors: ["文章", "李连杰", "刘诗诗", "陈妍希"]
    },
    {
      title: "封神传奇",
      year: "2016",
      studio: "博纳影业",
      director: "许安",
      description: "姜子牙辅佐武王伐纣",
      tags: ["fantasy", "action"],
      actors: ["李连杰", "范冰冰", "古天乐", "黄晓明"]
    },
    {
      title: "功守道",
      year: "2017",
      studio: "功守道影业",
      director: "马云",
      description: "太极高手的传奇故事",
      tags: ["action", "drama"],
      actors: ["马云", "李连杰", "甄子丹", "吴京"]
    },
    {
      title: "花木兰",
      year: "2020",
      studio: "迪士尼",
      director: "妮琪·卡罗",
      description: "花木兰替父从军的故事",
      tags: ["action", "costume"],
      actors: ["刘亦菲", "甄子丹", "巩俐", "李连杰"]
    }
  ],
  tv: [
    {
      title: "熊出没·逆转时空",
      year: "2024",
      studio: "华强方特",
      director: "林汇达",
      description: "光头强穿越时空的冒险故事",
      tags: ["animation", "comedy"],
      actors: ["张伟", "张秉君", "谭笑", "周子瑜"]
    },
    {
      title: "志愿军：雄兵出击",
      year: "2023",
      studio: "八一电影制片厂",
      director: "陈凯歌",
      description: "抗美援朝战争的历史画卷",
      tags: ["war", "history"],
      actors: ["唐国强", "王砚辉", "张颂文", "辛柏青"]
    },
    {
      title: "坚如磐石",
      year: "2023",
      studio: "光线传媒",
      director: "张艺谋",
      description: "警察在权力与正义之间的选择",
      tags: ["crime", "suspense"],
      actors: ["雷佳音", "张国立", "于和伟", "周冬雨"]
    },
    {
      title: "三大队",
      year: "2023",
      studio: "万达影视",
      director: "戴墨",
      description: "刑警队长追查真相的执着之旅",
      tags: ["crime", "drama"],
      actors: ["张译", "李晨", "魏晨", "曹炳琨"]
    },
    {
      title: "金手指",
      year: "2023",
      studio: "英皇电影",
      director: "庄文强",
      description: "香港金融诈骗案的真实故事",
      tags: ["crime", "drama"],
      actors: ["梁朝伟", "刘德华", "蔡卓妍", "陈家乐"]
    },
    {
      title: "潜行",
      year: "2023",
      studio: "博纳影业",
      director: "关智耀",
      description: "警察卧底打击毒品犯罪的故事",
      tags: ["crime", "action"],
      actors: ["刘德华", "林家栋", "彭于晏", "刘雅瑟"]
    },
    {
      title: "海关战线",
      year: "2024",
      studio: "英皇电影",
      director: "邱礼涛",
      description: "海关人员打击走私犯罪的故事",
      tags: ["action", "crime"],
      actors: ["谢霆锋", "张学友", "吴镇宇", "林嘉欣"]
    },
    {
      title: "危机航线",
      year: "2024",
      studio: "博纳影业",
      director: "彭顺",
      description: "劫机事件中乘客与劫匪的对决",
      tags: ["action", "suspense"],
      actors: ["刘德华", "张子枫", "屈楚萧", "李梦"]
    },
    {
      title: "749局",
      year: "2024",
      studio: "北京文化",
      director: "陆川",
      description: "神秘机构调查超自然事件",
      tags: ["sci-fi", "action"],
      actors: ["王俊凯", "苗苗", "郑恺", "任敏"]
    },
    {
      title: "浴火之路",
      year: "2024",
      studio: "欢喜传媒",
      director: "五百",
      description: "打拐题材电影，寻找被拐儿童",
      tags: ["crime", "drama"],
      actors: ["肖央", "赵丽颖", "刘烨", "潘斌龙"]
    },
    {
      title: "野孩子",
      year: "2024",
      studio: "坏猴子影业",
      director: "殷若昕",
      description: "流浪儿童与志愿者的温情故事",
      tags: ["drama", "realistic"],
      actors: ["王俊凯", "关子勰", "邓家佳", "周政杰"]
    },
    {
      title: "刺猬",
      year: "2024",
      studio: "北京文化",
      director: "顾长卫",
      description: "精神病人眼中的荒诞世界",
      tags: ["drama", "comedy"],
      actors: ["葛优", "王俊凯", "李萍", "恩美"]
    },
    {
      title: "逆行人生",
      year: "2024",
      studio: "欢喜传媒",
      director: "徐峥",
      description: "程序员失业后送外卖的人生转变",
      tags: ["drama", "realistic"],
      actors: ["徐峥", "辛芷蕾", "王骁", "丁勇岱"]
    },
    {
      title: "从21世纪安全撤离",
      year: "2024",
      studio: "李少红工作室",
      director: "李阳",
      description: "三个少年穿越时空的奇幻冒险",
      tags: ["sci-fi", "youth"],
      actors: ["张若昀", "钟楚曦", "朱颜曼滋", "吴晓亮"]
    },
    {
      title: "解密",
      year: "2024",
      studio: "上海电影",
      director: "陈思诚",
      description: "密码破译员的传奇人生",
      tags: ["drama", "history"],
      actors: ["刘昊然", "约翰·库萨克", "陈道明", "吴彦祖"]
    },
    {
      title: "白蛇：浮生",
      year: "2024",
      studio: "追光动画",
      director: "陈健喜",
      description: "白蛇传说的全新演绎",
      tags: ["animation", "fantasy"],
      actors: ["张喆", "杨天翔", "唐小喜", "郑小璞"]
    }
  ],
  tv: [
    {
      title: "庆余年",
      year: "2019",
      studio: "新丽传媒",
      director: "孙皓",
      description: "现代青年穿越到古代，在权谋中生存成长",
      tags: ["costume", "drama"],
      actors: ["张若昀", "李沁", "陈道明", "吴刚"]
    },
    {
      title: "琅琊榜",
      year: "2015",
      studio: "山东影视",
      director: "孔笙",
      description: "麒麟才子梅长苏辅佐靖王夺嫡的故事",
      tags: ["costume", "drama"],
      actors: ["胡歌", "刘涛", "王凯", "黄维德"]
    },
    {
      title: "甄嬛传",
      year: "2011",
      studio: "东申影业",
      director: "郑晓龙",
      description: "少女甄嬛在后宫中从单纯走向权谋的故事",
      tags: ["costume", "drama"],
      actors: ["孙俪", "陈建斌", "蔡少芬", "蒋欣"]
    },
    {
      title: "陈情令",
      year: "2019",
      studio: "新湃传媒",
      director: "郑伟文",
      description: "魏无羡与蓝忘机携手探寻真相，匡扶正义",
      tags: ["costume", "fantasy"],
      actors: ["肖战", "王一博", "孟子义", "宣璐"]
    },
    {
      title: "知否知否应是绿肥红瘦",
      year: "2018",
      studio: "正午阳光",
      director: "张开宙",
      description: "北宋官宦家庭少女明兰的成长与婚姻故事",
      tags: ["costume", "drama"],
      actors: ["赵丽颖", "冯绍峰", "朱一龙", "张佳宁"]
    },
    {
      title: "延禧攻略",
      year: "2018",
      studio: "欢娱影视",
      director: "惠楷栋",
      description: "宫女魏璎珞在紫禁城中逆袭成为皇贵妃",
      tags: ["costume", "drama"],
      actors: ["秦岚", "聂远", "佘诗曼", "吴谨言"]
    },
    {
      title: "长安十二时辰",
      year: "2019",
      studio: "娱跃传媒",
      director: "曹盾",
      description: "死囚张小敬必须在十二时辰内阻止恐怖袭击",
      tags: ["costume", "suspense"],
      actors: ["雷佳音", "易烊千玺", "周一围", "热依扎"]
    },
    {
      title: "都挺好",
      year: "2019",
      studio: "正午阳光",
      director: "简川訸",
      description: "现代家庭中的亲情与矛盾",
      tags: ["modern", "family"],
      actors: ["姚晨", "倪大红", "郭京飞", "高露"]
    },
    {
      title: "小欢喜",
      year: "2019",
      studio: "柠萌影业",
      director: "汪俊",
      description: "三个高考家庭的教育与成长故事",
      tags: ["modern", "family"],
      actors: ["黄磊", "海清", "陶虹", "沙溢"]
    },
    {
      title: "三十而已",
      year: "2020",
      studio: "柠萌影业",
      director: "张晓波",
      description: "三位三十岁女性面对生活与事业的选择",
      tags: ["modern", "drama"],
      actors: ["江疏影", "童瑶", "毛晓彤", "杨玏"]
    },
    {
      title: "隐秘的角落",
      year: "2020",
      studio: "爱奇艺",
      director: "辛爽",
      description: "三个孩子在景区游玩时意外拍下谋杀案",
      tags: ["suspense", "crime"],
      actors: ["秦昊", "王景春", "荣梓杉", "史彭元"]
    },
    {
      title: "沉默的真相",
      year: "2020",
      studio: "爱奇艺",
      director: "陈奕甫",
      description: "检察官历经十年追寻真相",
      tags: ["suspense", "crime"],
      actors: ["廖凡", "白宇", "谭卓", "宁理"]
    },
    {
      title: "狂飙",
      year: "2023",
      studio: "爱奇艺",
      director: "徐纪周",
      description: "刑警与黑恶势力长达20年的较量",
      tags: ["crime", "suspense"],
      actors: ["张译", "张颂文", "李一桐", "张志坚"]
    },
    {
      title: "漫长的季节",
      year: "2023",
      studio: "腾讯视频",
      director: "辛爽",
      description: "出租车司机追寻18年前碎尸案真相",
      tags: ["suspense", "drama"],
      actors: ["范伟", "秦昊", "陈明昊", "李庚希"]
    },
    {
      title: "三体",
      year: "2023",
      studio: "腾讯视频",
      director: "杨磊",
      description: "根据刘慈欣同名小说改编的科幻剧集",
      tags: ["sci-fi", "drama"],
      actors: ["张鲁一", "于和伟", "陈瑾", "王子文"]
    },
    {
      title: "开端",
      year: "2022",
      studio: "正午阳光",
      director: "孙墨龙",
      description: "公交车爆炸案的时间循环故事",
      tags: ["sci-fi", "suspense"],
      actors: ["白敬亭", "赵今麦", "刘奕君", "刘涛"]
    },
    {
      title: "梦华录",
      year: "2022",
      studio: "腾讯视频",
      director: "杨阳",
      description: "赵盼儿在东京开办茶坊的故事",
      tags: ["costume", "drama"],
      actors: ["刘亦菲", "陈晓", "柳岩", "林允"]
    },
    {
      title: "星汉灿烂",
      year: "2022",
      studio: "腾讯视频",
      director: "费振翔",
      description: "少女程少商与将军凌不疑的成长与爱情",
      tags: ["costume", "drama"],
      actors: ["吴磊", "赵露思", "郭涛", "曾黎"]
    },
    {
      title: "人世间",
      year: "2022",
      studio: "腾讯视频",
      director: "李路",
      description: "周家三代人在五十年时代变迁中的命运",
      tags: ["drama", "family"],
      actors: ["雷佳音", "宋佳", "辛柏青", "殷桃"]
    },
    {
      title: "苍兰诀",
      year: "2022",
      studio: "爱奇艺",
      director: "伊峥",
      description: "仙女小兰花与魔尊东方青苍的爱情故事",
      tags: ["fantasy", "costume"],
      actors: ["虞书欣", "王鹤棣", "张彬彬", "郭晓婷"]
    },
    {
      title: "卿卿日常",
      year: "2022",
      studio: "爱奇艺",
      director: "赵启辰",
      description: "古代女性的独立与成长故事",
      tags: ["costume", "comedy"],
      actors: ["白敬亭", "田曦薇", "陈小纭", "刘冠麟"]
    },
    {
      title: "风吹半夏",
      year: "2022",
      studio: "爱奇艺",
      director: "傅东育",
      description: "女性企业家在改革开放浪潮中的奋斗",
      tags: ["drama", "business"],
      actors: ["赵丽颖", "欧豪", "李光洁", "刘威"]
    },
    {
      title: "幸福到万家",
      year: "2022",
      studio: "优酷",
      director: "郑晓龙",
      description: "农村女性维护正义与公平的故事",
      tags: ["drama", "realistic"],
      actors: ["赵丽颖", "罗晋", "刘威", "唐曾"]
    },
    {
      title: "底线",
      year: "2022",
      studio: "芒果TV",
      director: "刘国彤",
      description: "法官们面对复杂案件的职业与人性考验",
      tags: ["drama", "legal"],
      actors: ["靳东", "成毅", "蔡文静", "王秀竹"]
    },
    {
      title: "罚罪",
      year: "2022",
      studio: "爱奇艺",
      director: "天毅",
      description: "警察与黑恶势力的正邪较量",
      tags: ["crime", "suspense"],
      actors: ["黄景瑜", "杨佑宁", "盖玥希", "赵荀"]
    },
    {
      title: "唐朝诡事录",
      year: "2022",
      studio: "爱奇艺",
      director: "柏杉",
      description: "唐代悬疑探案故事集",
      tags: ["costume", "suspense"],
      actors: ["杨旭文", "杨志刚", "郜思雯", "陈创"]
    },
    {
      title: "星落凝成糖",
      year: "2023",
      studio: "优酷",
      director: "朱锐斌",
      description: "双胞胎姐妹与天界神君的奇幻爱情",
      tags: ["fantasy", "costume"],
      actors: ["陈星旭", "李兰迪", "陈牧驰", "何宣林"]
    },
    {
      title: "长月烬明",
      year: "2023",
      studio: "优酷",
      director: "鞠觉亮",
      description: "神女与魔神的三世爱恨",
      tags: ["fantasy", "costume"],
      actors: ["罗云熙", "白鹿", "陈都灵", "邓为"]
    },
    {
      title: "云襄传",
      year: "2023",
      studio: "爱奇艺",
      director: "游达志",
      description: "书生云襄闯荡江湖的故事",
      tags: ["costume", "action"],
      actors: ["陈晓", "毛晓彤", "唐晓天", "许龄月"]
    },
    {
      title: "长相思",
      year: "2023",
      studio: "腾讯视频",
      director: "秦榛",
      description: "小夭与三位男子的爱恨纠葛",
      tags: ["costume", "fantasy"],
      actors: ["杨紫", "张晚意", "邓为", "檀健次"]
    },
    {
      title: "莲花楼",
      year: "2023",
      studio: "爱奇艺",
      director: "郭虎",
      description: "神医楼主人闯荡江湖探案",
      tags: ["costume", "suspense"],
      actors: ["成毅", "曾舜晞", "肖顺尧", "陈都灵"]
    },
    {
      title: "云之羽",
      year: "2023",
      studio: "爱奇艺",
      director: "郭敬明",
      description: "刺客与宫门之间的爱恨情仇",
      tags: ["costume", "action"],
      actors: ["虞书欣", "张凌赫", "丞磊", "卢昱晓"]
    },
    {
      title: "宁安如梦",
      year: "2023",
      studio: "爱奇艺",
      director: "朱锐斌",
      description: "重生后的复仇与爱情",
      tags: ["costume", "drama"],
      actors: ["白鹿", "张凌赫", "王星越", "周峻伟"]
    },
    {
      title: "一念关山",
      year: "2023",
      studio: "爱奇艺",
      director: "周靖韬",
      description: "女刺客与将军的江湖传奇",
      tags: ["costume", "action"],
      actors: ["刘诗诗", "刘宇宁", "方逸伦", "何蓝逗"]
    },
    {
      title: "脱轨",
      year: "2023",
      studio: "优酷",
      director: "沈阳",
      description: "两个时空的爱情故事",
      tags: ["modern", "romance"],
      actors: ["刘浩存", "林一", "黄圣池", "樊霖锋"]
    },
    {
      title: "与凤行",
      year: "2024",
      studio: "腾讯视频",
      director: "邓科",
      description: "碧苍王与上古神的爱情故事",
      tags: ["fantasy", "costume"],
      actors: ["赵丽颖", "林更新", "辛云来", "何与"]
    },
    {
      title: "庆余年2",
      year: "2024",
      studio: "新丽传媒",
      director: "孙皓",
      description: "范闲在朝堂与江湖中的权谋斗争",
      tags: ["costume", "drama"],
      actors: ["张若昀", "李沁", "陈道明", "吴刚"]
    }
  ],
  anime: [
    {
      title: "大鱼海棠",
      year: "2016",
      studio: "光线传媒",
      director: "梁旋",
      description: "掌管海棠花的少女湫为报恩而违反天规的故事",
      tags: ["animation", "fantasy"],
      actors: ["季冠霖", "苏尚卿", "许魏洲", "金士杰"]
    },
    {
      title: "白蛇：缘起",
      year: "2019",
      studio: "追光动画",
      director: "黄家康",
      description: "白素贞与许仙前世的爱情故事",
      tags: ["animation", "fantasy"],
      actors: ["张喆", "杨天翔", "唐小喜", "郑小璞"]
    },
    {
      title: "罗小黑战记",
      year: "2019",
      studio: "寒木春华",
      director: "MTJJ",
      description: "猫妖罗小黑与人类师父的冒险故事",
      tags: ["animation", "fantasy"],
      actors: ["山新", "郝祥海", "刘明月", "图特哈蒙"]
    },
    {
      title: "雄狮少年",
      year: "2021",
      studio: "易动文化",
      director: "孙海鹏",
      description: "留守少年参加舞狮比赛实现梦想",
      tags: ["animation", "youth"],
      actors: ["大昕", "大雄", "郭皓", "李盟"]
    },
    {
      title: "深海",
      year: "2023",
      studio: "十月文化",
      director: "田晓鹏",
      description: "少女参宿在深海大饭店的奇幻冒险",
      tags: ["animation", "fantasy"],
      actors: ["苏鑫", "王亭文", "滕奎兴", "阎么么"]
    },
    {
      title: "长安三万里",
      year: "2023",
      studio: "追光动画",
      director: "谢君伟",
      description: "高适与李白跨越数十年的友情与大唐盛景",
      tags: ["animation", "history"],
      actors: ["杨天翔", "凌振赫", "吴俊全", "宣晓鸣"]
    },
    {
      title: "新神榜：哪吒重生",
      year: "2021",
      studio: "追光动画",
      director: "赵霁",
      description: "哪吒转世到现代都市，与龙族再次对决",
      tags: ["animation", "action"],
      actors: ["杨天翔", "张赫", "宣晓鸣", "李诗萌"]
    },
    {
      title: "姜子牙",
      year: "2020",
      studio: "彩条屋影业",
      director: "程腾",
      description: "姜子牙在封神之后的自我救赎之旅",
      tags: ["animation", "fantasy"],
      actors: ["郑希", "杨凝", "王敏纳", "姜广涛"]
    },
    {
      title: "雾山五行",
      year: "2020",
      studio: "好传动画",
      director: "林魂",
      description: "五行使者守护人间的故事",
      tags: ["animation", "action"],
      actors: ["郭盛", "郝祥海", "叶知秋", "李轻扬"]
    },
    {
      title: "时光代理人",
      year: "2021",
      studio: "bilibili",
      director: "李豪凌",
      description: "通过照片进入过去，改变他人命运的故事",
      tags: ["animation", "suspense"],
      actors: ["苏尚卿", "歪歪", "李诗萌", "赵熠彤"]
    },
    {
      title: "一人之下",
      year: "2016",
      studio: "腾讯动漫",
      director: "王昕",
      description: "张楚岚隐藏身份进入异人世界的故事",
      tags: ["animation", "action"],
      actors: ["张楚岚", "冯宝宝", "王也", "张灵玉"]
    },
    {
      title: "魔道祖师",
      year: "2018",
      studio: "视美影业",
      director: "熊可",
      description: "魏无羡重生后与蓝忘机探寻真相",
      tags: ["animation", "fantasy"],
      actors: ["魏无羡", "蓝忘机", "江澄", "金子轩"]
    },
    {
      title: "全职高手",
      year: "2017",
      studio: "腾讯视频",
      director: "熊可",
      description: "职业选手叶修被俱乐部驱逐后重新崛起",
      tags: ["animation", "sports"],
      actors: ["叶修", "苏沐橙", "黄少天", "王杰希"]
    },
    {
      title: "狐妖小红娘",
      year: "2015",
      studio: "腾讯动漫",
      director: "王昕",
      description: "狐妖为人类再续前缘的奇幻故事",
      tags: ["animation", "fantasy"],
      actors: ["涂山苏苏", "白月初", "涂山雅雅", "东方月初"]
    },
    {
      title: "刺客伍六七",
      year: "2018",
      studio: "啊哈娱乐",
      director: "何小疯",
      description: "失忆刺客伍六七在小鸡岛的日常生活",
      tags: ["animation", "comedy"],
      actors: ["何小疯", "段艺璇", "马正阳", "文森"]
    },
    {
      title: "灵笼",
      year: "2019",
      studio: "艺画开天",
      director: "董相博",
      description: "末日世界中人类最后的生存堡垒",
      tags: ["animation", "sci-fi"],
      actors: ["李元韬", "陶典", "黄莺", "赵路"]
    },
    {
      title: "凡人修仙传",
      year: "2020",
      studio: "万维猫动画",
      director: "王裕仁",
      description: "普通少年韩立在修仙界中的成长历程",
      tags: ["animation", "fantasy"],
      actors: ["钱文青", "杨天翔", "唐小喜", "姜广涛"]
    },
    {
      title: "斗破苍穹",
      year: "2017",
      studio: "福煦影视",
      director: "丁磊",
      description: "天才少年萧炎从天才变成废柴后重新崛起",
      tags: ["animation", "fantasy"],
      actors: ["萧炎", "药老", "萧薰儿", "美杜莎"]
    },
    {
      title: "斗罗大陆",
      year: "2018",
      studio: "玄机科技",
      director: "沈乐平",
      description: "唐三穿越到斗罗大陆，修炼武魂的故事",
      tags: ["animation", "fantasy"],
      actors: ["唐三", "小舞", "戴沐白", "奥斯卡"]
    },
    {
      title: "完美世界",
      year: "2021",
      studio: "福煦影视",
      director: "汪成果",
      description: "石昊从大荒中走出的传奇故事",
      tags: ["animation", "fantasy"],
      actors: ["石昊", "火灵儿", "云曦", "月婵"]
    },
    {
      title: "熊出没·变形记",
      year: "2018",
      studio: "华强方特",
      director: "丁亮",
      description: "光头强和熊大熊二缩小后微观世界冒险",
      tags: ["animation", "comedy"],
      actors: ["张伟", "张秉君", "谭笑", "周子瑜"]
    },
    {
      title: "新神榜：杨戬",
      year: "2022",
      studio: "追光动画",
      director: "赵霁",
      description: "杨戬在封神大战后的故事",
      tags: ["animation", "fantasy"],
      actors: ["王凯", "季冠霖", "李诗萌", "赵路"]
    },
    {
      title: "山海经之再见怪兽",
      year: "2022",
      studio: "吾立方数码",
      director: "黄健明",
      description: "医师与神兽共同拯救苍生的故事",
      tags: ["animation", "fantasy"],
      actors: ["刘琮", "祁昕", "张遥函", "巫蛊悠悠"]
    },
    {
      title: "猪猪侠·恐龙日记",
      year: "2021",
      studio: "咏声动漫",
      director: "陆锦明",
      description: "猪猪侠穿越到恐龙时代的冒险",
      tags: ["animation", "comedy"],
      actors: ["陆双", "陈志荣", "祖晴", "徐经纬"]
    },
    {
      title: "喜羊羊与灰太狼之筐出未来",
      year: "2022",
      studio: "原创动力",
      director: "黄伟明",
      description: "羊狼联合篮球队参加篮球大赛",
      tags: ["animation", "sports"],
      actors: ["祖晴", "张琳", "梁颖", "邓玉婷"]
    },
    {
      title: "茶啊二中",
      year: "2023",
      studio: "凝羽动画",
      director: "夏铭泽",
      description: "东北中学校园生活喜剧",
      tags: ["animation", "comedy"],
      actors: [ "邢原源", "王博文", "高禹", "黄恒"]
    },
    {
      title: "我是江小白",
      year: "2017",
      studio: "两点十分动漫",
      director: "金冬",
      description: "大学校园的青春爱情故事",
      tags: ["animation", "youth"],
      actors: ["陈张太康", "佟心竹", "李兰陵", "常蓉珊"]
    },
    {
      title: "镜·双城",
      year: "2022",
      studio: "企鹅影视",
      director: "刘富源",
      description: "云荒大陆上的奇幻爱情故事",
      tags: ["animation", "fantasy"],
      actors: ["马正阳", "段艺璇", "赵成晨", "王潇倩"]
    },
    {
      title: "吞噬星空",
      year: "2020",
      studio: "玄机科技",
      director: "沈乐平",
      description: "地球青年罗峰成长为宇宙强者的故事",
      tags: ["animation", "sci-fi"],
      actors: ["赵乾景", "谢莹", "宋国庆", "黄骥"]
    },
    {
      title: "西行纪",
      year: "2018",
      studio: "百漫文化",
      director: "钟智行",
      description: "唐僧师徒西天取经后的奇幻故事",
      tags: ["animation", "fantasy"],
      actors: ["夏磊", "吴磊", "沈达威", "鬼月"]
    },
    {
      title: "天宝伏妖录",
      year: "2020",
      studio: "玄机科技",
      director: "沈乐平",
      description: "唐朝驱魔师的奇幻冒险",
      tags: ["animation", "fantasy"],
      actors: ["锦鲤", "彭尧", "北辰", "胡良伟"]
    },
    {
      title: "眷思量",
      year: "2021",
      studio: "燃烧映画",
      director: "赵禹晴",
      description: "思量岛上神仙与凡人的故事",
      tags: ["animation", "fantasy"],
      actors: ["凃雄飞", "段艺璇", "赵成晨", "赵双"]
    },
    {
      title: "星域四万年",
      year: "2022",
      studio: "福熙影视",
      director: "赵真",
      description: "星际时代的修真故事",
      tags: ["animation", "sci-fi"],
      actors: ["马洋", "李轻扬", "山新", "阎么么"]
    },
    {
      title: "神印王座",
      year: "2022",
      studio: "神漫文化",
      director: "曾元俊",
      description: "骑士龙皓晨守护人类的故事",
      tags: ["animation", "fantasy"],
      actors: ["常蓉珊", "锦鲤", "阎么么", "李兰陵"]
    },
    {
      title: "万界仙踪",
      year: "2018",
      studio: "若鸿文化",
      director: "叶老酒",
      description: "少年叶星云的修仙之路",
      tags: ["animation", "fantasy"],
      actors: ["钟巍", "弓与蛇", "谢莹", "秦且歌"]
    },
    {
      title: "万界神主",
      year: "2019",
      studio: "若鸿文化",
      director: "叶老酒",
      description: "神王叶辰重活一世的故事",
      tags: ["animation", "fantasy"],
      actors: ["徐翔", "柳知萧", "默伶", "唐泽宗"]
    },
    {
      title: "妖神记",
      year: "2017",
      studio: "若鸿文化",
      director: "叶老酒",
      description: "聂离重生回到少年时代的故事",
      tags: ["animation", "fantasy"],
      actors: ["谷江山", "柳知萧", "默伶", "张妮"]
    },
    {
      title: "无上神帝",
      year: "2020",
      studio: "索以文化",
      director: "龚朝",
      description: "神帝秦命逆天改命的故事",
      tags: ["animation", "fantasy"],
      actors: ["袁铭喆", "张雨濛", "李翰林", "段富超"]
    },
    {
      title: "独步逍遥",
      year: "2020",
      studio: "索以文化",
      director: "龚朝",
      description: "叶宇在修仙界的传奇故事",
      tags: ["animation", "fantasy"],
      actors: ["张恩泽", "王梦华", "王宁", "赵双"]
    },
    {
      title: "逆天至尊",
      year: "2021",
      studio: "索以文化",
      director: "龚朝",
      description: "谭云重生复仇的故事",
      tags: ["animation", "fantasy"],
      actors: ["张雨濛", "魏茹晨", "王宁", "唐子晰"]
    },
    {
      title: "九域之神",
      year: "2022",
      studio: "福熙影视",
      director: "赵真",
      description: "少年林动在九域的冒险故事",
      tags: ["animation", "fantasy"],
      actors: ["李兰陵", "常蓉珊", "李轻扬", "山新"]
    },
    {
      title: "百炼成神",
      year: "2022",
      studio: "福熙影视",
      director: "赵真",
      description: "罗征在炼狱中的成长故事",
      tags: ["animation", "fantasy"],
      actors: ["赵乾景", "谢莹", "宋国庆", "黄骥"]
    },
    {
      title: "师兄啊师兄",
      year: "2022",
      studio: "玄机科技",
      director: "沈乐平",
      description: "李长寿在修仙界的稳健生活",
      tags: ["animation", "comedy"],
      actors: ["杨天翔", "赵爽", "赵成晨", "张馨予"]
    },
    {
      title: "龙蛇演义",
      year: "2022",
      studio: "万维猫动画",
      director: "刘怀",
      description: "王超的国术修炼之路",
      tags: ["animation", "action"],
      actors: ["马正阳", "宝木中阳", "文森", "胡良伟"]
    },
    {
      title: "长剑风云",
      year: "2021",
      studio: "虚纪文化",
      director: "韦琪",
      description: "末世中少女贺将的战斗故事",
      tags: ["animation", "action"],
      actors: ["季冠霖", "图特哈蒙", "林帽帽", "李轻扬"]
    },
    {
      title: "黑门",
      year: "2022",
      studio: "三格动画",
      director: "李相国",
      description: "未来世界脑机接口引发的危机",
      tags: ["animation", "sci-fi"],
      actors: ["阿杰", "郭浩然", "聂曦映", "钱琛"]
    }
  ]
};

// 现有演员数据
let existingActors = require('./config/actor.json').actor;

// 创建演员映射表，方便查找
const actorMap = new Map();
existingActors.forEach(actor => {
  actorMap.set(actor.name, actor);
});

// 补充演员信息
const additionalActors = [
  { name: "吴京", nickname: "京哥", birthday: "1974-04-03", memo: "战狼", rating: 5, favorites: true },
  { name: "屈楚萧", nickname: "", birthday: "1994-12-28", memo: "新生代演员", rating: 4, favorites: false },
  { name: "李光洁", nickname: "", birthday: "1981-04-23", memo: "实力演员", rating: 4, favorites: false },
  { name: "吴孟达", nickname: "达叔", birthday: "1952-01-02", memo: "黄金配角", rating: 5, favorites: true },
  { name: "弗兰克·格里罗", nickname: "Frank", birthday: "1965-06-08", memo: "好莱坞演员", rating: 4, favorites: false },
  { name: "卢靖姗", nickname: "", birthday: "1985-06-10", memo: "混血演员", rating: 4, favorites: false },
  { name: "张译", nickname: "译哥", birthday: "1978-02-17", memo: "影帝", rating: 5, favorites: true },
  { name: "黄景瑜", nickname: "鲸鱼", birthday: "1992-11-30", memo: "硬汉小生", rating: 4, favorites: false },
  { name: "杜江", nickname: "", birthday: "1985-09-10", memo: "军旅演员", rating: 4, favorites: false },
  { name: "吕艳婷", nickname: "", birthday: "1990-02-19", memo: "配音演员", rating: 4, favorites: false },
  { name: "囧森瑟夫", nickname: "", birthday: "1992-08-15", memo: "配音演员", rating: 4, favorites: false },
  { name: "瀚墨", nickname: "", birthday: "1993-05-20", memo: "配音演员", rating: 4, favorites: false },
  { name: "陈浩", nickname: "", birthday: "1979-02-14", memo: "配音演员", rating: 4, favorites: false },
  { name: "刘昊然", nickname: "昊然弟弟", birthday: "1997-10-10", memo: "少年感演员", rating: 5, favorites: true },
  { name: "陈赫", nickname: "赫哥", birthday: "1985-11-09", memo: "综艺咖", rating: 4, favorites: false },
  { name: "佟丽娅", nickname: "丫丫", birthday: "1983-08-08", memo: "新疆美女", rating: 5, favorites: true },
  { name: "周一围", nickname: "", birthday: "1982-08-24", memo: "实力演员", rating: 4, favorites: false },
  { name: "王传君", nickname: "", birthday: "1985-10-18", memo: "文艺青年", rating: 5, favorites: false },
  { name: "谭卓", nickname: "", birthday: "1983-09-25", memo: "文艺片女王", rating: 5, favorites: true },
  { name: "贾玲", nickname: "玲姐", birthday: "1982-04-29", memo: "喜剧演员", rating: 5, favorites: true },
  { name: "张小斐", nickname: "", birthday: "1986-01-10", memo: "喜剧演员", rating: 4, favorites: false },
  { name: "易烊千玺", nickname: "千千", birthday: "2000-11-28", memo: "全能偶像", rating: 5, favorites: true },
  { name: "雷佳音", nickname: "雷子", birthday: "1983-08-29", memo: "实力演员", rating: 5, favorites: true },
  { name: "费翔", nickname: "", birthday: "1960-12-24", memo: "不老男神", rating: 5, favorites: true },
  { name: "李雪健", nickname: "", birthday: "1954-02-20", memo: "老戏骨", rating: 5, favorites: true },
  { name: "于适", nickname: "", birthday: "1996-01-22", memo: "新生代演员", rating: 4, favorites: false },
  { name: "段奕宏", nickname: "", birthday: "1973-05-16", memo: "硬汉演员", rating: 5, favorites: true },
  { name: "朱亚文", nickname: "", birthday: "1984-04-21", memo: "行走的荷尔蒙", rating: 4, favorites: false },
  { name: "姜武", nickname: "", birthday: "1969-05-04", memo: "实力演员", rating: 4, favorites: false },
  { name: "王千源", nickname: "", birthday: "1972-06-08", memo: "黄金配角", rating: 5, favorites: false },
  { name: "黄志忠", nickname: "", birthday: "1969-03-05", memo: "军旅演员", rating: 4, favorites: false },
  { name: "周冬雨", nickname: "冬叔", birthday: "1992-01-31", memo: "三金影后", rating: 5, favorites: true },
  { name: "尹昉", nickname: "", birthday: "1986-07-15", memo: "文艺青年", rating: 4, favorites: false },
  { name: "黄觉", nickname: "", birthday: "1974-08-05", memo: "文艺男神", rating: 4, favorites: false },
  { name: "董子健", nickname: "", birthday: "1993-12-19", memo: "90后演员", rating: 4, favorites: false },
  { name: "殷桃", nickname: "桃桃", birthday: "1979-06-22", memo: "视后", rating: 5, favorites: false },
  { name: "成泰燊", nickname: "", birthday: "1971-06-12", memo: "实力演员", rating: 4, favorites: false },
  { name: "朱一龙", nickname: "龙哥", birthday: "1988-04-16", memo: "实力演员", rating: 5, favorites: true },
  { name: "杨恩又", nickname: "", birthday: "2013-07-16", memo: "童星", rating: 4, favorites: false },
  { name: "王戈", nickname: "", birthday: "1989-08-10", memo: "喜剧演员", rating: 4, favorites: false },
  { name: "刘陆", nickname: "", birthday: "1982-06-23", memo: "舞台演员", rating: 4, favorites: false },
  { name: "马丽", nickname: "玛丽", birthday: "1982-06-28", memo: "喜剧女王", rating: 5, favorites: true },
  { name: "常远", nickname: "", birthday: "1981-09-25", memo: "开心麻花", rating: 4, favorites: false },
  { name: "李成儒", nickname: "", birthday: "1954-11-25", memo: "老戏骨", rating: 4, favorites: false },
  { name: "王一博", nickname: "啵啵", birthday: "1997-08-05", memo: "流量明星", rating: 4, favorites: false },
  { name: "刘敏涛", nickname: "", birthday: "1976-01-10", memo: "实力演员", rating: 5, favorites: true },
  { name: "小沈阳", nickname: "", birthday: "1981-05-07", memo: "喜剧演员", rating: 4, favorites: false },
  { name: "倪妮", nickname: "", birthday: "1988-08-08", memo: "气质女神", rating: 5, favorites: true },
  { name: "文咏珊", nickname: "", birthday: "1988-12-29", memo: "香港演员", rating: 4, favorites: false },
  { name: "金晨", nickname: "", birthday: "1990-09-05", memo: "舞蹈演员", rating: 4, favorites: false },
  { name: "咏梅", nickname: "", birthday: "1970-02-14", memo: "影后", rating: 5, favorites: true },
  { name: "张若昀", nickname: "", birthday: "1988-08-24", memo: "实力演员", rating: 5, favorites: true },
  { name: "黄维德", nickname: "", birthday: "1971-10-28", memo: "台湾演员", rating: 4, favorites: false },
  { name: "孙俪", nickname: "娘娘", birthday: "1982-09-26", memo: "收视女王", rating: 5, favorites: true },
  { name: "陈建斌", nickname: "", birthday: "1970-06-27", memo: "老戏骨", rating: 5, favorites: true },
  { name: "蔡少芬", nickname: "", birthday: "1973-09-17", memo: "香港演员", rating: 4, favorites: false },
  { name: "蒋欣", nickname: "欣姐", birthday: "1983-05-08", memo: "实力演员", rating: 5, favorites: false },
  { name: "肖战", nickname: "战战", birthday: "1991-10-05", memo: "顶流明星", rating: 5, favorites: true },
  { name: "孟子义", nickname: "", birthday: "1995-10-06", memo: "新生代演员", rating: 4, favorites: false },
  { name: "宣璐", nickname: "", birthday: "1991-01-15", memo: "古装演员", rating: 4, favorites: false },
  { name: "冯绍峰", nickname: "", birthday: "1978-10-07", memo: "实力演员", rating: 4, favorites: false },
  { name: "张佳宁", nickname: "", birthday: "1989-05-26", memo: "新生代演员", rating: 4, favorites: false },
  { name: "秦岚", nickname: "岚姐", birthday: "1979-07-17", memo: "气质演员", rating: 5, favorites: true },
  { name: "聂远", nickname: "", birthday: "1978-06-17", memo: "古装演员", rating: 4, favorites: false },
  { name: "佘诗曼", nickname: "", birthday: "1975-05-22", memo: "TVB视后", rating: 5, favorites: true },
  { name: "吴谨言", nickname: "", birthday: "1990-08-16", memo: "新生代演员", rating: 4, favorites: false },
  { name: "热依扎", nickname: "", birthday: "1986-07-15", memo: "新疆演员", rating: 4, favorites: false },
  { name: "高露", nickname: "", birthday: "1982-10-08", memo: "实力演员", rating: 4, favorites: false },
  { name: "陶虹", nickname: "", birthday: "1972-09-29", memo: "实力演员", rating: 5, favorites: true },
  { name: "沙溢", nickname: "溢哥", birthday: "1978-02-15", memo: "综艺咖", rating: 4, favorites: false },
  { name: "江疏影", nickname: "", birthday: "1986-09-01", memo: "都市女性", rating: 4, favorites: false },
  { name: "童瑶", nickname: "", birthday: "1985-08-11", memo: "实力演员", rating: 5, favorites: true },
  { name: "毛晓彤", nickname: "", birthday: "1988-02-16", memo: "甜美女演员", rating: 4, favorites: false },
  { name: "杨玏", nickname: "", birthday: "1987-03-02", memo: "星二代", rating: 4, favorites: false },
  { name: "王景春", nickname: "", birthday: "1973-02-12", memo: "影帝", rating: 5, favorites: true },
  { name: "荣梓杉", nickname: "", birthday: "2006-02-03", memo: "童星", rating: 4, favorites: false },
  { name: "史彭元", nickname: "", birthday: "2005-08-16", memo: "童星", rating: 4, favorites: false },
  { name: "廖凡", nickname: "", birthday: "1974-02-14", memo: "影帝", rating: 5, favorites: true },
  { name: "白宇", nickname: "", birthday: "1990-04-08", memo: "实力演员", rating: 5, favorites: true },
  { name: "宁理", nickname: "", birthday: "1968-03-12", memo: "老戏骨", rating: 5, favorites: false },
  { name: "张颂文", nickname: "", birthday: "1976-05-10", memo: "实力演员", rating: 5, favorites: true },
  { name: "李一桐", nickname: "", birthday: "1990-09-06", memo: "新生代演员", rating: 4, favorites: false },
  { name: "张志坚", nickname: "", birthday: "1955-01-04", memo: "老戏骨", rating: 5, favorites: true },
  { name: "范伟", nickname: "", birthday: "1962-09-02", memo: "喜剧演员", rating: 5, favorites: true },
  { name: "陈明昊", nickname: "", birthday: "1977-08-29", memo: "舞台演员", rating: 4, favorites: false },
  { name: "李庚希", nickname: "", birthday: "2000-04-22", memo: "00后演员", rating: 4, favorites: false },
  { name: "张鲁一", nickname: "", birthday: "1980-06-07", memo: "实力演员", rating: 5, favorites: true },
  { name: "陈瑾", nickname: "", birthday: "1964-05-04", memo: "老戏骨", rating: 5, favorites: false },
  { name: "王子文", nickname: "", birthday: "1987-02-28", memo: "都市演员", rating: 4, favorites: false },
  { name: "白敬亭", nickname: "小白", birthday: "1993-10-15", memo: "综艺咖", rating: 4, favorites: false },
  { name: "赵今麦", nickname: "麦麦", birthday: "2002-09-29", memo: "新生代演员", rating: 5, favorites: true },
  { name: "刘奕君", nickname: "", birthday: "1970-06-12", memo: "老戏骨", rating: 5, favorites: true },
  { name: "陈晓", nickname: "", birthday: "1987-07-05", memo: "古装男神", rating: 5, favorites: true },
  { name: "柳岩", nickname: "", birthday: "1980-11-08", memo: "性感女星", rating: 4, favorites: false },
  { name: "林允", nickname: "", birthday: "1996-04-16", memo: "星女郎", rating: 4, favorites: false },
  { name: "吴磊", nickname: "三石", birthday: "1999-12-26", memo: "童星出身", rating: 5, favorites: true },
  { name: "赵露思", nickname: "", birthday: "1998-11-09", memo: "甜美女演员", rating: 4, favorites: false },
  { name: "曾黎", nickname: "", birthday: "1977-09-17", memo: "中戏校花", rating: 4, favorites: false },
  { name: "宋佳", nickname: "小宋佳", birthday: "1980-11-17", memo: "时尚辣妈", rating: 5, favorites: false },
  { name: "辛柏青", nickname: "", birthday: "1973-06-20", memo: "国家话剧院", rating: 5, favorites: false },
  { name: "季冠霖", nickname: "", birthday: "1980-01-16", memo: "配音演员", rating: 4, favorites: false },
  { name: "苏尚卿", nickname: "", birthday: "1990-05-30", memo: "配音演员", rating: 4, favorites: false },
  { name: "许魏洲", nickname: "", birthday: "1994-10-20", memo: "歌手演员", rating: 4, favorites: false },
  { name: "金士杰", nickname: "", birthday: "1951-12-01", memo: "台湾演员", rating: 5, favorites: true },
  { name: "张喆", nickname: "", birthday: "1988-08-12", memo: "配音演员", rating: 4, favorites: false },
  { name: "杨天翔", nickname: "", birthday: "1990-08-14", memo: "配音演员", rating: 4, favorites: false },
  { name: "唐小喜", nickname: "", birthday: "1985-02-26", memo: "配音演员", rating: 4, favorites: false },
  { name: "郑小璞", nickname: "", birthday: "1987-03-15", memo: "配音演员", rating: 4, favorites: false },
  { name: "山新", nickname: "", birthday: "1988-01-10", memo: "配音演员", rating: 5, favorites: true },
  { name: "郝祥海", nickname: "", birthday: "1982-04-05", memo: "配音演员", rating: 4, favorites: false },
  { name: "刘明月", nickname: "", birthday: "1991-07-12", memo: "配音演员", rating: 4, favorites: false },
  { name: "图特哈蒙", nickname: "", birthday: "1986-09-20", memo: "配音演员", rating: 4, favorites: false },
  { name: "大昕", nickname: "", birthday: "1995-03-08", memo: "配音演员", rating: 4, favorites: false },
  { name: "大雄", nickname: "", birthday: "1990-06-15", memo: "配音演员", rating: 4, favorites: false },
  { name: "郭皓", nickname: "", birthday: "1988-11-22", memo: "配音演员", rating: 4, favorites: false },
  { name: "李盟", nickname: "", birthday: "1992-04-30", memo: "配音演员", rating: 4, favorites: false },
  { name: "苏鑫", nickname: "", birthday: "1989-05-18", memo: "配音演员", rating: 4, favorites: false },
  { name: "王亭文", nickname: "", birthday: "1992-07-25", memo: "配音演员", rating: 4, favorites: false },
  { name: "滕奎兴", nickname: "", birthday: "1975-02-10", memo: "配音演员", rating: 4, favorites: false },
  { name: "阎么么", nickname: "", birthday: "1993-08-06", memo: "配音演员", rating: 4, favorites: false },
  { name: "凌振赫", nickname: "", birthday: "1984-10-02", memo: "配音演员", rating: 4, favorites: false },
  { name: "吴俊全", nickname: "", birthday: "1972-05-20", memo: "配音演员", rating: 4, favorites: false },
  { name: "宣晓鸣", nickname: "", birthday: "1978-11-15", memo: "配音演员", rating: 4, favorites: false },
  { name: "李诗萌", nickname: "", birthday: "1990-01-08", memo: "配音演员", rating: 4, favorites: false },
  { name: "郑希", nickname: "", birthday: "1983-06-25", memo: "配音演员", rating: 4, favorites: false },
  { name: "杨凝", nickname: "", birthday: "1991-03-12", memo: "配音演员", rating: 4, favorites: false },
  { name: "王敏纳", nickname: "", birthday: "1988-09-18", memo: "配音演员", rating: 4, favorites: false },
  { name: "姜广涛", nickname: "", birthday: "1976-05-06", memo: "配音演员", rating: 5, favorites: true },
  { name: "郭盛", nickname: "", birthday: "1984-02-14", memo: "配音演员", rating: 4, favorites: false },
  { name: "叶知秋", nickname: "", birthday: "1987-07-28", memo: "配音演员", rating: 4, favorites: false },
  { name: "李轻扬", nickname: "", birthday: "1990-12-05", memo: "配音演员", rating: 4, favorites: false },
  { name: "歪歪", nickname: "", birthday: "1992-08-20", memo: "配音演员", rating: 4, favorites: false },
  { name: "赵熠彤", nickname: "", birthday: "1989-04-15", memo: "配音演员", rating: 4, favorites: false }
];

// 合并演员数据
additionalActors.forEach(newActor => {
  if (!actorMap.has(newActor.name)) {
    actorMap.set(newActor.name, newActor);
    existingActors.push(newActor);
  }
});

// 生成电影目录和文件
function generateMovies() {
  let totalMovies = 0;
  let movieCount = 0;
  let tvCount = 0;
  let animeCount = 0;
  
  // 生成电影
  console.log('开始生成电影...');
  moviesData.movies.forEach((movie, index) => {
    const id = `movie-${movie.title}`;
    const movieDir = path.join('movies', 'movie', `movie-${movie.title}`);
    
    // 创建目录
    if (!fs.existsSync(movieDir)) {
      fs.mkdirSync(movieDir, { recursive: true });
    }
    
    // 创建movie.nfo文件
    const nfoContent = generateNfo(id, movie);
    fs.writeFileSync(path.join(movieDir, 'movie.nfo'), nfoContent);
    
    // 更新index.json
    movieCount++;
    totalMovies++;
  });
  
  // 生成电视剧
  console.log('开始生成电视剧...');
  moviesData.tv.forEach((tv, index) => {
    const id = `tv-${tv.title}`;
    const tvDir = path.join('movies', 'tv', `tv-${tv.title}`);
    
    // 创建目录
    if (!fs.existsSync(tvDir)) {
      fs.mkdirSync(tvDir, { recursive: true });
    }
    
    // 创建movie.nfo文件
    const nfoContent = generateNfo(id, tv);
    fs.writeFileSync(path.join(tvDir, 'movie.nfo'), nfoContent);
    
    // 更新index.json
    tvCount++;
    totalMovies++;
  });
  
  // 生成动画片
  console.log('开始生成动画片...');
  moviesData.anime.forEach((anime, index) => {
    const id = `anime-${anime.title}`;
    const animeDir = path.join('movies', 'anime', `anime-${anime.title}`);
    
    // 创建目录
    if (!fs.existsSync(animeDir)) {
      fs.mkdirSync(animeDir, { recursive: true });
    }
    
    // 创建movie.nfo文件
    const nfoContent = generateNfo(id, anime);
    fs.writeFileSync(path.join(animeDir, 'movie.nfo'), nfoContent);
    
    // 更新index.json
    animeCount++;
    totalMovies++;
  });
  
  console.log(`生成完成！总计: ${totalMovies} 部作品 (电影: ${movieCount}, 电视剧: ${tvCount}, 动画片: ${animeCount})`);
}

// 生成NFO文件内容
function generateNfo(id, movieData) {
  const actors = movieData.actors.map(actor => `<name>${actor}</name>`).join('\n        ');
  const tags = movieData.tags.map(tag => `<tag>${tag}</tag>`).join('\n    ');
  
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<movie>
    <id>${id}</id>
    <title>${movieData.title}</title>
    <year>${movieData.year}</year>
    <studio>${movieData.studio}</studio>
    <director>${movieData.director}</director>
    <description>${movieData.description}</description>
    ${tags}
    <actor>
        ${actors}
    </actor>
    <fileinfo>
        <streamdetails>
            <video>
                <durationinseconds>7200</durationinseconds>
            </video>
        </streamdetails>
    </fileinfo>
</movie>`;
}

// 更新index.json文件
function updateIndexFiles() {
  console.log('更新索引文件...');
  
  // 更新电影索引
  const movieIndex = { movies: [] };
  moviesData.movies.forEach(movie => {
    movieIndex.movies.push({
      id: `movie-${movie.title}`,
      name: movie.title,
      title: movie.title,
      description: movie.description,
      year: movie.year,
      outline: "",
      director: movie.director,
      actors: movie.actors,
      studio: movie.studio,
      tags: movie.tags,
      fileCount: 0
    });
  });
  
  // 更新电视剧索引
  const tvIndex = { movies: [] };
  moviesData.tv.forEach(tv => {
    tvIndex.movies.push({
      id: `tv-${tv.title}`,
      name: tv.title,
      title: tv.title,
      description: tv.description,
      year: tv.year,
      outline: "",
      director: tv.director,
      actors: tv.actors,
      studio: tv.studio,
      tags: tv.tags,
      fileCount: 0
    });
  });
  
  // 更新动画片索引
  const animeIndex = { movies: [] };
  moviesData.anime.forEach(anime => {
    animeIndex.movies.push({
      id: `anime-${anime.title}`,
      name: anime.title,
      title: anime.title,
      description: anime.description,
      year: anime.year,
      outline: "",
      director: anime.director,
      actors: anime.actors,
      studio: anime.studio,
      tags: anime.tags,
      fileCount: 0
    });
  });
  
  fs.writeFileSync('movies/movie/index.json', JSON.stringify(movieIndex, null, 2));
  fs.writeFileSync('movies/tv/index.json', JSON.stringify(tvIndex, null, 2));
  fs.writeFileSync('movies/anime/index.json', JSON.stringify(animeIndex, null, 2));
  
  console.log('索引文件更新完成！');
}

// 更新actor.json
function updateActorJson() {
  console.log('更新演员数据...');
  
  const actorData = {
    actor: Array.from(actorMap.values())
  };
  
  fs.writeFileSync('config/actor.json', JSON.stringify(actorData, null, 2));
  
  console.log('演员数据更新完成！');
}

// 执行所有操作
generateMovies();
updateIndexFiles();
updateActorJson();

console.log('全部任务完成！');
