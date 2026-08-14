// ============================================================
// generator-config.js - 生成器配置常量 + 产品数据配置
// ============================================================

// 问答 Agent 默认关闭。只有维护者显式改为 true 时才会初始化前端组件。
const AI_QA_AGENT_ENABLED = false;

const SENIORITY_MAP = {
    '1': '小登 (2025/2026)',
    '2': '中登 (2022-2024)',
    '3': '老资历 (2021前)'
};

const DEPT_COL_MAP = {
    9: 'COS部',
    10: '技术部',
    11: '轻音部',
    12: '原创部',
    13: '舞装部',
    14: '外宣部'
};


const DEPT_CONTENT_CONFIG = {
    'COS部': {
        statsCol1: 17, statsCol1Name: 'cos次数',
        statsCol2: 18, statsCol2Name: '返图数量',
        roleOptionCols: [
            { col: 19, label: '全能coser' },
            { col: 20, label: '妙手妆娘' },
            { col: 21, label: '靠谱后勤' },
            { col: 22, label: '漫展该溜子' }
        ],
        customRoleCol: 23,
        images: [{ img: 24, desc: 25 }, { img: 26, desc: 27 }, { img: 28, desc: 29 }]
    },
    '技术部': {
        statsCol1: 30, statsCol1Name: '熬夜记录',
        statsCol2: 31, statsCol2Name: '快门/剪辑',
        roleOptionCols: [
            { col: 32, label: '前期拍摄' },
            { col: 33, label: '后期爆肝' },
            { col: 34, label: '道具练成' },
            { col: 35, label: '教学导师' }
        ],
        customRoleCol: 36,
        images: [{ img: 37, desc: 38 }, { img: 39, desc: 40 }, { img: 41, desc: 42 }]
    },
    '轻音部': {
        statsCol1: 43, statsCol1Name: '排练时长',
        statsCol2: 44, statsCol2Name: '最爱的歌',
        roleOptionCols: [
            { col: 45, label: '主唱' },
            { col: 46, label: '乐手' },
            { col: 47, label: '氛围组' },
            { col: 48, label: '还在寻找队友' }
        ],
        customRoleCol: 49,
        images: [{ img: 50, desc: 51 }, { img: 52, desc: 53 }, { img: 54, desc: 55 }]
    },
    '原创部': {
        statsCol1: 56, statsCol1Name: '产出数量',
        statsCol2: 57, statsCol2Name: 'OC数量',
        roleOptionCols: [
            { col: 58, label: '文手太太' },
            { col: 59, label: '灵魂画师' },
            { col: 60, label: '设定狂魔' },
            { col: 61, label: '催更读者' }
        ],
        customRoleCol: 62,
        images: [{ img: 63, desc: 64 }, { img: 65, desc: 66 }, { img: 67, desc: 68 }]
    },
    '舞装部': {
        statsCol1: 69, statsCol1Name: '学舞数量',
        statsCol2: 70, statsCol2Name: '排练时间',
        roleOptionCols: [
            { col: 71, label: '宅舞' },
            { col: 72, label: '街舞' },
            { col: 73, label: 'wota艺' },
            { col: 74, label: '舞台全能' }
        ],
        customRoleCol: 75,
        images: [{ img: 76, desc: 77 }, { img: 78, desc: 79 }, { img: 80, desc: 81 }]
    },
    '外宣部': {
        statsCol1: 82, statsCol1Name: '看番数量',
        statsCol2: 83, statsCol2Name: '线下活动',
        roleOptionCols: [
            { col: 84, label: '番剧百事通' },
            { col: 85, label: '补番大手子' },
            { col: 86, label: '水群能手' },
            { col: 87, label: '月饭发起人' }
        ],
        customRoleCol: 88,
        images: [{ img: 89, desc: 90 }, { img: 91, desc: 92 }, { img: 93, desc: 94 }]
    }
};


const COMMON_CONFIG = {
    freeSpiritCol: 15,
    activityCol: 16,
    ipCol: 95,
    ipPhotoCol: 96,
    keywordCol: 97,
    memorableQuoteCol: 98,
    memoryPhotoCol: 99,
    memoryDescCol: 100,
    groupPhotoCol: 101,
    groupDescCol: 102
};


const PHOTO_DEPT_RULES = [
    { keyword: 'cos', dept: 'COS部' },
    { keyword: '技术', dept: '技术部' },
    { keyword: '轻音', dept: '轻音部' },
    { keyword: '原创', dept: '原创部' },
    { keyword: '舞部', dept: '舞装部' },
    { keyword: '舞', dept: '舞装部' },
    { keyword: 'dance', dept: '舞装部' },
    { keyword: '外宣', dept: '外宣部' }
];


function createEmptyWeeklyPhotos() {
    return {
        'COS部': [],
        '技术部': [],
        '轻音部': [],
        '原创部': [],
        '舞装部': [],
        '外宣部': []
    };
}


const GENERATOR_STATE = {
    cleanData: [],
    weeklyPhotos: createEmptyWeeklyPhotos(),
    bgm1: '',
    bgm2: '',
    parsedName: '',
    uploadedImageMap: new Map(),
    lastMediaSummary: { replaced: 0, unresolved: 0 }
};

const CONFIG = {
    starCount: 3500,
    brightStarCount: 1200,
    dustCount: 600,
    tinyStarCount: 2000,
    orbitRadius: 45,
    orbitSpeed: 0.08,
};


const HUB_DATA = { id: 'hub', name: '佐佑·星云核心', data: 'TOTAL ENTRIES', color: '#ffffff', scale: 6.0 };

// 周常照片配置 - 由生成器注入
// ================= 外宣部影响力看板数据 =================
const WEIXIN_ARTICLES = [{"type": "wx", "title": "电锯人 蕾塞篇 影评——这部剧场版你能打几分？", "date": "2025-12-16", "value": 86, "cover": "https://mmbiz.qlogo.cn/mmbiz_jpg/ia8mcZRmuguwkXsXdvh3d6icv2VVVg3f2jianE1YlW7jpHibHJT2ERGH0oTkKXiaGsz24tSU7pS1jDZ97qSHqMZ5Dpw/0?wx_fmt=jpeg", "link": "http://mp.weixin.qq.com/s?__biz=MjM5OTk3OTY5Mg==&mid=2650952385&idx=1&sn=aa4f3fc2f1c594afd90250782bdf952a&chksm=bcc5cd028bb24414282216d721b427283a38bb67f006fcb31a9b7e1aaf4a44424be737a0aba7#rd", "extra": ""}, {"type": "wx", "title": "佐佑幻想研十一月动漫电影影评合辑——十一月上映的四部电影中，有你喜欢的吗？", "date": "2025-12-05", "value": 58, "cover": "https://mmbiz.qlogo.cn/mmbiz_jpg/ia8mcZRmuguxd3n47ZNa6rXHcYeGsl9fd9ZHwRUBtjKOekP78BURw1gWTwaVt4bdDSUuL2IBxjAPBLHCFGiaXnvg/0?wx_fmt=jpeg", "link": "http://mp.weixin.qq.com/s?__biz=MjM5OTk3OTY5Mg==&mid=2650952379&idx=1&sn=2ae1cce6074eb3a9e201b93b9c9147de&chksm=bcc5cd788bb2446ef78f0c1d2842dba9203c70a31454e7be4f054c29ecefb27a342b6cc90a57#rd", "extra": ""}, {"type": "wx", "title": "简评《假面骑士加布夏季剧场版》——by澜星", "date": "2025-12-02", "value": 84, "cover": "https://mmbiz.qlogo.cn/mmbiz_jpg/ia8mcZRmuguwfjFe5u6J92Cf5eKf4rL5H6L2sGzFL8lRTCV2v1Z5wL1Stw1qLxiby6ZFann0NgLDosjedWksiaR2Q/0?wx_fmt=jpeg", "link": "http://mp.weixin.qq.com/s?__biz=MjM5OTk3OTY5Mg==&mid=2650952366&idx=1&sn=cdae88bf1c98615dc49ec4ceb0558bd8&chksm=bcc5cd6d8bb2447b52716144f063b8efa925f33268f0c2f700a7ec88d6f7f4aa8d40a3372319#rd", "extra": ""}, {"type": "wx", "title": "佑子的「十一月」周常大调查", "date": "2025-11-27", "value": 152, "cover": "https://mmbiz.qlogo.cn/mmbiz_jpg/ia8mcZRmuguzHr7tRhgew3WJEkfMj5B8GlHeQOgOAaYfJC3lKOichPstPQurtiaDrcUEiaL8dc2joARtEBCGXiakiajw/0?wx_fmt=jpeg", "link": "http://mp.weixin.qq.com/s?__biz=MjM5OTk3OTY5Mg==&mid=2650952356&idx=1&sn=b98fb03d39cf320283182595348496e8&chksm=bcc5cd678bb244714ceeb1b30b65a3e700d2f5e68e9d6469bca154cfece923772d3d07e20bc4#rd", "extra": ""}, {"type": "wx", "title": "相比旅行，更是冒险——by胶水双核", "date": "2025-11-22", "value": 74, "cover": "https://mmbiz.qlogo.cn/mmbiz_jpg/ia8mcZRmuguymaDIJVjFbOvFOUQZuHv44jpLFx4eTvrCmCoq4mVBkBf7mibNyMiakuK4NsPPtXWDePjBiacdiajR9qA/0?wx_fmt=jpeg", "link": "http://mp.weixin.qq.com/s?__biz=MjM5OTk3OTY5Mg==&mid=2650952350&idx=1&sn=f25b8eab0900df0ef988acb52f86c5d2&chksm=bcc5cd5d8bb2444be07efd6d7b8ebb062d340334c4570811522fc56e3591341d2fa1c86538f2#rd", "extra": ""}, {"type": "wx", "title": "eva新剧场版这个世界线怎么是财团b赢了的世界线——by小咔er", "date": "2025-11-17", "value": 81, "cover": "https://mmbiz.qlogo.cn/mmbiz_jpg/ia8mcZRmuguz5cN9yVMb1NfC0rnEWn9ib2yic4Pic8InfRFnHHl1TxD0tlb0ssLFXqe6exyicAh1GDd2h8Zdccuc28A/0?wx_fmt=jpeg", "link": "http://mp.weixin.qq.com/s?__biz=MjM5OTk3OTY5Mg==&mid=2650952319&idx=1&sn=a57768abd2462a29f40d73e70c82e8ab&chksm=bcc5cdbc8bb244aa10bc78a9c9e558d93e0f222786814c594f2a10ac752cac8c4b6bdcb86dad#rd", "extra": ""}, {"type": "wx", "title": "正因为是你，我才能绽放奇迹——by星河长鸣月兰夜", "date": "2025-11-05", "value": 225, "cover": "https://mmbiz.qlogo.cn/mmbiz_jpg/ia8mcZRmuguwfGw4VNXP376sXCFyib5x2e1uHUWzgGdltd36C1ERwm8U7Myfhql3LB2sTPyHnl06ibe2HTrlnXUAw/0?wx_fmt=jpeg", "link": "http://mp.weixin.qq.com/s?__biz=MjM5OTk3OTY5Mg==&mid=2650952308&idx=1&sn=0b129025c1b8ba273921fbdbdfac7e3f&chksm=bcc5cdb78bb244a13720cf5c6eb7e8cc4bbcce2f182ed58282ee0563444ce2c1e3f542ac4c46#rd", "extra": ""}, {"type": "wx", "title": "写给平凡的与不幸的创作者——《世界计划：无法歌唱的初音未来》观后感和影评——by蓝水心", "date": "2025-11-01", "value": 155, "cover": "https://mmbiz.qlogo.cn/mmbiz_jpg/ia8mcZRmuguykhrfLT0ZMzmEfcdphOXv0zIDPvDDNDKXtHoNzJNgyQDZx5rjKjQiavuiaXFRL8WHZVkYUL3sIRcyQ/0?wx_fmt=jpeg", "link": "http://mp.weixin.qq.com/s?__biz=MjM5OTk3OTY5Mg==&mid=2650952299&idx=1&sn=33e4abe0b8f7b3c278714be74090192c&chksm=bcc5cda88bb244be9751ea81b61e6773e506a32a5750e3f712a04d5e778e1698d920da664a6b#rd", "extra": ""}, {"type": "wx", "title": "新吊带袜天使完结简评——扳机社献给观众的又一超级力作—by玉子厨", "date": "2025-10-29", "value": 186, "cover": "https://mmbiz.qlogo.cn/mmbiz_jpg/ia8mcZRmuguz35VUYAXQyk82bIxv6xkvVlVicXwpIFRNjwNjItiaOwZSqBVsXEIfr5Gjiauppr4OpnoahQE0spn7Fw/0?wx_fmt=jpeg", "link": "http://mp.weixin.qq.com/s?__biz=MjM5OTk3OTY5Mg==&mid=2650952259&idx=1&sn=53c0b92702d008bec12be3ef112d7350&chksm=bcc5cd808bb24496620c93a588a0140a68401952dec36a8dc091a2a8f45bc12098fb2dd67286#rd", "extra": ""}, {"type": "wx", "title": "佐佑动漫社百团回顾~和佑子再逛一回百团吧！", "date": "2025-10-24", "value": 290, "cover": "https://mmbiz.qlogo.cn/mmbiz_jpg/ia8mcZRmuguwAVzPdYFzIMhmTiaxdw7DVSyanhRt802vThc4ctFj8Gkofxc1SGql7IfCMXOjy8MGiczFt6ZDk1UIA/0?wx_fmt=jpeg", "link": "http://mp.weixin.qq.com/s?__biz=MjM5OTk3OTY5Mg==&mid=2650952244&idx=1&sn=129277f2cd594259a2ae6054364f2a8b&chksm=bcc5cdf78bb244e1140e84bdba25a9886d69ffce511fb0a225f07c59d3b6f1b23e23210b0c8c#rd", "extra": ""}, {"type": "wx", "title": "动力甲也可以那么美丽吗——机甲战魔神话之裔——by传统的幻想aya", "date": "2025-10-23", "value": 85, "cover": "https://mmbiz.qlogo.cn/mmbiz_jpg/ia8mcZRmuguzQhEeuLZb1hed7t24RahCFgXcBzHWeTrapQuExG8ngBjMjQlhF0WR9FGBdUbfPLTpaSfzEr3xfnA/0?wx_fmt=jpeg", "link": "http://mp.weixin.qq.com/s?__biz=MjM5OTk3OTY5Mg==&mid=2650952200&idx=1&sn=203b5863237d1b401d59b8949c5adbd1&chksm=bcc5cdcb8bb244dd8fd7662c116f1a255e328ef6b2571a598dff12a6bd3ed86eb4bfd10fe7a5#rd", "extra": ""}, {"type": "wx", "title": "百团大战，来动漫社玩吧！", "date": "2025-10-17", "value": 508, "cover": "https://mmbiz.qlogo.cn/mmbiz_jpg/ia8mcZRmuguzFTNNg8viatZQgUicKGiaX7ClMcsKjr21nmFte8uC0lTBTZGEBPKywFFthQriaHp11d12icrqA3Z8bzUA/0?wx_fmt=jpeg", "link": "http://mp.weixin.qq.com/s?__biz=MjM5OTk3OTY5Mg==&mid=2650952129&idx=1&sn=90ea48a46902fa213b51ac637455fa4b&chksm=bcc5ce028bb247145c459ffa8c1b182f9e7004c923bde36197d8d2019889c8662f8231efa9bd#rd", "extra": ""}, {"type": "wx", "title": "从千年女王扯一扯太空歌剧——by 铁火辉夜月", "date": "2025-10-16", "value": 99, "cover": "https://mmbiz.qlogo.cn/mmbiz_jpg/ia8mcZRmuguzUvDllvIhYyMBrOTt4ibKvrmIN9kOk3yZqicVbrBMdStc904w1ggMyDVg19tnsghr3OPicncnl8LcicQ/0?wx_fmt=jpeg", "link": "http://mp.weixin.qq.com/s?__biz=MjM5OTk3OTY5Mg==&mid=2650952124&idx=1&sn=2c899ad1516a17806cd69aa8d6e00a0d&chksm=bcc5ce7f8bb24769ca8f768bd046288612929575fa3ce736299e772ccbe515f7e4910ecd72a9#rd", "extra": ""}, {"type": "wx", "title": "佐佑动漫社 第27届干部介绍来啦！", "date": "2025-10-09", "value": 401, "cover": "https://mmbiz.qlogo.cn/mmbiz_jpg/ia8mcZRmuguzU66zhFggCo8T6A1KNicDcQ7yAvn0hCK3xP0ySic9oRKnUR1mkn7eLic7tToP5vQsQicZicQBZ2ssmAvg/0?wx_fmt=jpeg", "link": "http://mp.weixin.qq.com/s?__biz=MjM5OTk3OTY5Mg==&mid=2650952103&idx=1&sn=95ebee190688d51d2c621fc6df644919&chksm=bcc5ce648bb2477248ac30ac1f95b1d88d2bb90f6f9b0df667adfe57c2b2ba6665d3672737ad#rd", "extra": ""}, {"type": "wx", "title": "九连者简评：能看到他真幸运——by铁火辉夜月", "date": "2025-10-05", "value": 59, "cover": "https://mmbiz.qlogo.cn/mmbiz_jpg/ia8mcZRmuguywCf1TfIN7iaFjIFqbFib9afHP23bQKd6icrA8BPLVNvw8BSaW0NrUl2iajD3icaEElib0xp7WCdf6JLoA/0?wx_fmt=jpeg", "link": "http://mp.weixin.qq.com/s?__biz=MjM5OTk3OTY5Mg==&mid=2650952073&idx=1&sn=3e782d3a477cc6e847abdc1b06a0c3f4&chksm=bcc5ce4a8bb2475c803f9f2b503a1af0fed8763478916f23813d1f1f6864da37a2366fb7384d#rd", "extra": ""}, {"type": "wx", "title": "盛夏迎新！佐佑新伙伴追番大揭秘喵", "date": "2025-09-19", "value": 169, "cover": "https://mmbiz.qlogo.cn/mmbiz_jpg/ia8mcZRmuguw7gGCiauicfCwSRUGqvoFsbaglBjyJhshkZ2yCOT0onMUdABm8Sibv9R2HxCk8FFbicCHxibRZSRAoLtQ/0?wx_fmt=jpeg", "link": "http://mp.weixin.qq.com/s?__biz=MjM5OTk3OTY5Mg==&mid=2650952047&idx=1&sn=b8e39ee2c5c231d6f99bf99990d75921&chksm=bcc5ceac8bb247ba6a5b45a98d45be78921a58fb5dfcbf6d92cd638af491b12e9b6a8617f3f6#rd", "extra": ""}, {"type": "wx", "title": "《化物语》短杂谈——by胶水双核", "date": "2025-07-06", "value": 125, "cover": "https://mmbiz.qlogo.cn/mmbiz_jpg/ia8mcZRmuguyKBIr8WU1trg9ZoTmWia9lflvo1TlSiapvfM9tJUXibss2oHVbfUks60BN6jpHNx20taqsegstf2edQ/0?wx_fmt=jpeg", "link": "http://mp.weixin.qq.com/s?__biz=MjM5OTk3OTY5Mg==&mid=2650952037&idx=1&sn=c7c27ea991d6e578b5ae28c7b03e2b4f&chksm=bcc5cea68bb247b0062d13595b463a55c91a497557fe479bd4157c7a6a003baa49769ea2ecb7#rd", "extra": ""}, {"type": "wx", "title": "爱，青春与jc——blankus白", "date": "2025-07-05", "value": 142, "cover": "https://mmbiz.qlogo.cn/mmbiz_jpg/ia8mcZRmuguwT4iaVl1SbzEbicsFOQUDpsuXCLUxsddWeoeIZyDxpMXPLgQnZI2o8swrOk1dLqtLv4ezS3QU43xVQ/0?wx_fmt=jpeg", "link": "http://mp.weixin.qq.com/s?__biz=MjM5OTk3OTY5Mg==&mid=2650952020&idx=1&sn=094127473f0120afd3288dee6844cfcf&chksm=bcc5ce978bb247815883a3ca8ddf2037bf6d1535fa20f4ecc44e19384887199e4048f99df965#rd", "extra": ""}, {"type": "wx", "title": "新海诚：距离唤起的思念——By轩轩", "date": "2025-07-04", "value": 114, "cover": "https://mmbiz.qlogo.cn/mmbiz_jpg/ia8mcZRmuguxiaadVgrpJUfMHdib6VwX42bBYoLxRDAMFqaibqwJg2fZ27Vm6vJsvj6gmsx6TibdlZ2SiaksBIFR1kFg/0?wx_fmt=jpeg", "link": "http://mp.weixin.qq.com/s?__biz=MjM5OTk3OTY5Mg==&mid=2650951983&idx=1&sn=fe84752c9a8f972065ba2179810de0cc&chksm=bcc5ceec8bb247fa9bf0d16c237e2b9d9b39c31f191c9af934b960df921be4aaf7bdae8e1927#rd", "extra": ""}, {"type": "wx", "title": "指尖的梦想永不落幕——模型同好会2025春季学期最后一次活动记录及宣传推广", "date": "2025-06-06", "value": 168, "cover": "https://mmbiz.qlogo.cn/mmbiz_jpg/ia8mcZRmuguwf4K0iaSWWicT4cen06Vk1DnuDdAdXvWBlpZev3JTBE8zd2GnHaNBFz9mJHX8U6xWUsGN0KQ4wWjCw/0?wx_fmt=jpeg", "link": "http://mp.weixin.qq.com/s?__biz=MjM5OTk3OTY5Mg==&mid=2650951914&idx=1&sn=85823e523749fbe038f2065faee0c0e5&chksm=bcc5cf298bb2463ffe7430f679ee2bc60e270831ba7c2c545e807a4f5c0479c2a4adb34e82a5#rd", "extra": ""}, {"type": "wx", "title": "社庆倒计时0天！", "date": "2025-05-25", "value": 190, "cover": "https://mmbiz.qlogo.cn/mmbiz_jpg/ia8mcZRmuguwjcmKS4LZvFBYA29CyLzBTBTK9kwG9IjLyUVeSl4UskU26uXibR7DicjoTg2j2L4zLQTrjuib6GgInA/0?wx_fmt=jpeg", "link": "http://mp.weixin.qq.com/s?__biz=MjM5OTk3OTY5Mg==&mid=2650951908&idx=1&sn=673e28d2529da04149e71a6cf576e347&chksm=bcc5cf278bb24631dd1ff5fd7db9e4fda5270be575984f2731a3a28aade4b80d03a944dc031c#rd", "extra": ""}, {"type": "wx", "title": "情报解禁！炒作七天的社庆节目单大公开", "date": "2025-05-24", "value": 381, "cover": "https://mmbiz.qlogo.cn/mmbiz_jpg/ia8mcZRmuguy1JEeqplyPEdOFHFjbMGbM6onaiaCYV8Zq8KTo6MX3o3Gr3THQEPCB7hNwAetSB0Pial1wXr04lEaQ/0?wx_fmt=jpeg", "link": "http://mp.weixin.qq.com/s?__biz=MjM5OTk3OTY5Mg==&mid=2650951896&idx=1&sn=389e18d0fc595b3b1691fe6872cb9412&chksm=bcc5cf1b8bb2460d0e228233d5a3de3e60add96bc0fb896d63360ecaa6ddf9c0ad988f02e7d3#rd", "extra": ""}, {"type": "wx", "title": "社庆倒计时2天！！", "date": "2025-05-23", "value": 99, "cover": "https://mmbiz.qlogo.cn/mmbiz_jpg/ia8mcZRmuguxtjmfdA5R5qF8C8ydjgnkdIdOXvQbPaN9TiaGsbHECRjFfplXKkrIdxDudibpg3xP0dGKPxOyuoAuw/0?wx_fmt=jpeg", "link": "http://mp.weixin.qq.com/s?__biz=MjM5OTk3OTY5Mg==&mid=2650951880&idx=1&sn=039488fbab1239267eb3e4c3559a6576&chksm=bcc5cf0b8bb2461d0f0a0bce5b70ab30eb851adb54857818bd1389ac896dcbc758ed9cdbc3f0#rd", "extra": ""}, {"type": "wx", "title": "周日在做什么？有没有空？可以来看社庆吗？", "date": "2025-05-22", "value": 323, "cover": "https://mmbiz.qlogo.cn/mmbiz_jpg/ia8mcZRmuguxtjmfdA5R5qF8C8ydjgnkdeNJiaGVa7QpvfvwYgDrntDlmeYaHicRiaJXf1d1HVOsA6deGgL8gS1IyA/0?wx_fmt=jpeg", "link": "http://mp.weixin.qq.com/s?__biz=MjM5OTk3OTY5Mg==&mid=2650951859&idx=1&sn=46835302d4fb598cb61480e39c4a339d&chksm=bcc5cf708bb246669bfded9ef0d2241445cd1e2ff7fab9f5eb98b37f75b0aec13c9ba5aafb38#rd", "extra": ""}, {"type": "wx", "title": "社庆4天倒计时！", "date": "2025-05-21", "value": 122, "cover": "https://mmbiz.qlogo.cn/mmbiz_jpg/ia8mcZRmugux0jQnDNr89b3RdiaVAkIqg5nyyVS3setl2UzricTSZNor1iafMVUtRQ00DRMOoIzIZ50lwQQO2SRAcg/0?wx_fmt=jpeg", "link": "http://mp.weixin.qq.com/s?__biz=MjM5OTk3OTY5Mg==&mid=2650951840&idx=1&sn=918bdb2fa985b31d03b129cc7bf0cf9b&chksm=bcc5cf638bb246753d42fd9c4437595989df55145de8ffb817ead96746c4d614e9d26b7153de#rd", "extra": ""}, {"type": "wx", "title": "还有5天，哦内该，来社庆看band吧！", "date": "2025-05-20", "value": 162, "cover": "https://mmbiz.qlogo.cn/mmbiz_jpg/ia8mcZRmugux0jQnDNr89b3RdiaVAkIqg5cIZ9WlxcrULhoTqaSRNiacTfMae8kA3sn1rxfbmuXhN7HiarQjHqa8ww/0?wx_fmt=jpeg", "link": "http://mp.weixin.qq.com/s?__biz=MjM5OTk3OTY5Mg==&mid=2650951827&idx=1&sn=78012977e4730f1089168d8d08f0e1bf&chksm=bcc5cf508bb24646e1f108776d1eb3ed0bab52b17c73f77fb60de8ff5e2e3b0e1a6c89d9b155#rd", "extra": ""}, {"type": "wx", "title": "什么，还有六天就社庆了？！", "date": "2025-05-19", "value": 219, "cover": "https://mmbiz.qlogo.cn/mmbiz_jpg/ia8mcZRmuguw7RFObZoW7X3MJLicXrVIXcHKmOHx6u4LBhicn2bGGrp9w8j5vr4TQb5x3yKubbEftpibSqcrpybyYg/0?wx_fmt=jpeg", "link": "http://mp.weixin.qq.com/s?__biz=MjM5OTk3OTY5Mg==&mid=2650951815&idx=1&sn=313fae591c363eca3c3c03afc1225191&chksm=bcc5cf448bb2465270916ac34825fddeb5017a21488de6b0d221200bc084625f90dd68a3108f#rd", "extra": ""}, {"type": "wx", "title": "《评分7.9! 被删减耽误的青春平淡真味？！》", "date": "2025-03-14", "value": 122, "cover": "https://mmbiz.qlogo.cn/mmbiz_jpg/ia8mcZRmuguwiaMRYr3a6btxtzwGl9QItrPEVyNx3bK8yZQ5nib5ZtFJPl352CGb8fC6Qtibp7uCxia4mQ2XlEvKXkw/0?wx_fmt=jpeg", "link": "http://mp.weixin.qq.com/s?__biz=MjM5OTk3OTY5Mg==&mid=2650951806&idx=1&sn=7ebdf6674ce7565ed617b3f92ee31671&chksm=bcc5cfbd8bb246abd460600dedb818a58456151170264fed9ac354ae098460072c94c4d7f35c#rd", "extra": ""}];


const BILIBILI_VIDEOS = [{"type": "bili", "title": "【wota艺】SAYONARA MAYBE-次元与佐佑的超时空跨年企划", "date": "2026/1/4", "value": 493, "cover": "http://i2.hdslb.com/bfs/archive/ba8bedc0e8842f27b69ee8bca005bfe812cbadcc.jpg", "link": "https://www.bilibili.com/video/BV12JirB7Ecz", "extra": "4:05"}, {"type": "bili", "title": "【青空のラプソディ】《小林家的龙丫头：怕寂寞的龙》特别周常", "date": "2025/11/28", "value": 271, "cover": "http://i1.hdslb.com/bfs/archive/1ddc98b0bbfcc32d240ea1cd7fd33acae260de5e.jpg", "link": "https://www.bilibili.com/video/BV1N8SuBbEv1", "extra": "1:31"}, {"type": "bili", "title": "【佐佑动漫社】2025百团大战 OP！", "date": "2025/10/25", "value": 885, "cover": "http://i0.hdslb.com/bfs/archive/586b91b48e614a1b204cdd07a9fa7c4571f402eb.jpg", "link": "https://www.bilibili.com/video/BV1Awsoz1EC4", "extra": "3:02"}, {"type": "bili", "title": "百团也要MORE！JUMP！MORE！", "date": "2025/10/22", "value": 13378, "cover": "http://i0.hdslb.com/bfs/archive/bdc22b8e573a93ea0c2e213268c1bed1a24ac1f6.jpg", "link": "https://www.bilibili.com/video/BV1iAstzHEfz", "extra": "3:07"}, {"type": "bili", "title": "WOTA艺大串烧【佐佑动漫社26周年社庆单品】", "date": "2025/9/12", "value": 443, "cover": "http://i0.hdslb.com/bfs/archive/0693414c9d407de21db575f2bead3b61101e23d4.jpg", "link": "https://www.bilibili.com/video/BV1XeHkz1Ep5", "extra": "11:35"}, {"type": "bili", "title": "又一年难忘今宵，合成所有人快乐的歌【佐佑动漫社26届社庆单品】", "date": "2025/8/31", "value": 764, "cover": "http://i0.hdslb.com/bfs/archive/bc9a243b8aa9b9d34cb471123aca9ff92d19611b.jpg", "link": "https://www.bilibili.com/video/BV1c4aGzKEYF", "extra": "4:07"}, {"type": "bili", "title": "校园偶像们的hack【佐佑动漫社26周年社庆单品】", "date": "2025/8/27", "value": 548, "cover": "http://i0.hdslb.com/bfs/archive/bfef37509da31187f37a07888cc6e0482bfe6a80.jpg", "link": "https://www.bilibili.com/video/BV1szeUzSE4b", "extra": "3:22"}, {"type": "bili", "title": "凛和海未的偶像宣言！【佐佑动漫社26周年社庆单品】", "date": "2025/8/21", "value": 465, "cover": "http://i2.hdslb.com/bfs/archive/1cfa8260186e81f22ad1af0cec4e01313bf86c0d.jpg", "link": "https://www.bilibili.com/video/BV1qaYDzuExp", "extra": "2:02"}, {"type": "bili", "title": "《拼凑的断音》焰圆版【佐佑动漫社26周年社庆单品】", "date": "2025/8/16", "value": 1839, "cover": "http://i1.hdslb.com/bfs/archive/91153d1d3442d33284ce71148dd8a4a9a3c05cba.jpg", "link": "https://www.bilibili.com/video/BV1ssbrzJESf", "extra": "3:15"}, {"type": "bili", "title": "我们弗雷尔卓德也要有自己的明日方舟", "date": "2025/8/10", "value": 5363, "cover": "http://i2.hdslb.com/bfs/archive/c3a96f0fb396e36857b747442298d0a2aeca327a.jpg", "link": "https://www.bilibili.com/video/BV1GybNzfESg", "extra": "3:20"}, {"type": "bili", "title": "与灯和鼓子一起用雪菜猩红风暴点燃学校小剧场🔥【CHASE/虹咲】【佐佑动漫社26周年社庆单品】", "date": "2025/8/8", "value": 627, "cover": "http://i1.hdslb.com/bfs/archive/a9ade6c66fd6c0f8946808b4b1db927cde49c6ef.jpg", "link": "https://www.bilibili.com/video/BV19vt6zZEQs", "extra": "3:20"}, {"type": "bili", "title": "色は匂へど散りぬるを【佐佑动漫社26届社庆单品】", "date": "2025/8/5", "value": 1116, "cover": "http://i2.hdslb.com/bfs/archive/37b3c19adb5cd3f038d22a1769398e3db177cfe6.jpg", "link": "https://www.bilibili.com/video/BV1XFtJzwEr5", "extra": "4:22"}, {"type": "bili", "title": "唱跳双杀燃炸全场！学校是请来了星野爱本人吗？【Butter-Fly & アイドル】【佐佑动漫社26周年社庆单品】", "date": "2025/8/2", "value": 2000, "cover": "http://i0.hdslb.com/bfs/archive/18ceac491c4bdb6b6956b4b812e5f516179caf81.jpg", "link": "https://www.bilibili.com/video/BV1YJhtzwEUM", "extra": "7:54"}, {"type": "bili", "title": "言って 【佐佑动漫社26届社庆单品】", "date": "2025/7/29", "value": 641, "cover": "http://i1.hdslb.com/bfs/archive/418f97c85b0e7ce8c9c4732f9d780f02285b4742.jpg", "link": "https://www.bilibili.com/video/BV1gw8XzoExM", "extra": "4:16"}, {"type": "bili", "title": "除了冰淇淋，露比酱还有别的花活?超绝舞台AAO!【LoveLive!/AAO】【佐佑动漫社26周年社庆单品】", "date": "2025/7/25", "value": 812, "cover": "http://i2.hdslb.com/bfs/archive/bf26e03d69dc5f0cc57fa77187d1c63083386860.jpg", "link": "https://www.bilibili.com/video/BV1dzbDzfE2u", "extra": "4:21"}, {"type": "bili", "title": "寄明月【佐佑动漫社26届社庆单品】", "date": "2025/7/14", "value": 957, "cover": "http://i0.hdslb.com/bfs/archive/7ea77c3f684852311ac5721e89c18c30535899fe.jpg", "link": "https://www.bilibili.com/video/BV1nyuvzkEMa", "extra": "2:29"}, {"type": "bili", "title": "强风大背头（手书）【佐佑动漫社26届社庆单品】", "date": "2025/7/10", "value": 815, "cover": "http://i2.hdslb.com/bfs/archive/c535d2419523a3352c84d48a0016bf5dfcd1d99c.jpg", "link": "https://www.bilibili.com/video/BV1KVG3z4EXM", "extra": "2:17"}, {"type": "bili", "title": "原来校园偶像真的能在大学里存在!✨【LoveLive!/μ's】【佐佑动漫社26周年社庆单品】", "date": "2025/6/30", "value": 1468, "cover": "http://i1.hdslb.com/bfs/archive/444d58864985f5192d884cfe2718a26b06b29cf6.jpg", "link": "https://www.bilibili.com/video/BV1iTK2zdEi6", "extra": "9:05"}, {"type": "bili", "title": "【ED】无题—创作欲【佐佑动漫社26周年社庆单品】", "date": "2025/6/21", "value": 496, "cover": "http://i0.hdslb.com/bfs/archive/05593aa0105e2bfec8137da1c4622b8259332a0b.jpg", "link": "https://www.bilibili.com/video/BV1AnKKzREKQ", "extra": "3:07"}, {"type": "bili", "title": "【IDOLiSH7】Crz Love｜原创自编舞台-佐佑26th社庆超前瞻！", "date": "2025/6/10", "value": 3508, "cover": "http://i1.hdslb.com/bfs/archive/afc7221af837ea78f145c6ff94cad8dc61a96a27.jpg", "link": "https://www.bilibili.com/video/BV1PFTizyECS", "extra": "3:03"}, {"type": "bili", "title": "那一天的cos，接力起来！【佐佑动漫社26周年社庆单品】", "date": "2025/6/4", "value": 1152, "cover": "http://i0.hdslb.com/bfs/archive/8fd72c760acbfd2952ac000809847c21d23b4be2.jpg", "link": "https://www.bilibili.com/video/BV1Vr7YzLE1R", "extra": "11:19"}, {"type": "bili", "title": "《东方韭菜盒子 ~ Touhou CaiCaiBox》传遍qq群的东方舞台剧？【佐佑动漫社26周年社庆单品】", "date": "2025/5/27", "value": 26557, "cover": "http://i1.hdslb.com/bfs/archive/b8f06fafdd8ef7e9f0897a4b27cc2dfc43750b79.jpg", "link": "https://www.bilibili.com/video/BV14MjozwE8G", "extra": "21:16"}, {"type": "bili", "title": "【洛天依原创】《佑托邦》feat. 初音未来『这里容得下所有踉跄』【佐佑动漫社26周年社庆单品】", "date": "2025/5/25", "value": 5180, "cover": "http://i0.hdslb.com/bfs/archive/520079f901b8b9776b7eaf23353da8446351617a.jpg", "link": "https://www.bilibili.com/video/BV1xNjuzfE3F", "extra": "3:32"}, {"type": "bili", "title": "【佐佑动漫社】什么？是学校里的随舞！", "date": "2025/5/8", "value": 2167, "cover": "http://i2.hdslb.com/bfs/archive/d0bc40779f5117645b8ce03e12623b546a8f45d3.jpg", "link": "https://www.bilibili.com/video/BV1eCVhzhEpk", "extra": "96:06:00"}];


const DEPARTMENTS = [
    { id: 'art', name: '原创部', data: '作品 85 · 签绘 200+', color: '#f0f0f0', color2: '#87cefa', scale: 2.3, angle: 0, type: 'ink', hasRing: false, hasSatellites: true, satCount: 2, satType: 'quill', hoverText: '"创意无限"' },
    { id: 'cos', name: 'COS部', data: '正片 60 · 舞台 12场', color: '#7a4d54', color2: '#d89fbf', scale: 2.5, angle: Math.PI / 3, type: 'cos_refined', hasRing: true, ringType: 'dual_layer', hasSatellites: true, satCount: 2, satType: 'cos_props_v2', hoverText: '"查看正片细节"' },
    { id: 'pr', name: '外宣部', data: '推文 58 · 粉丝 10W+', color: '#ff8c00', color2: '#ffb6c1', scale: 2.6, angle: 2 * Math.PI / 3, type: 'signal', hasRing: false, hasSatellites: true, satCount: 5, satType: 'icon', hoverText: '"粉丝数 +123..."' },
    { id: 'tech', name: '技术部', data: '代码 12W · 资产 12TB', color: '#2f4f4f', color2: '#00ffff', scale: 2.6, angle: Math.PI, type: 'circuit', hasRing: true, ringType: 'data', hasSatellites: false, hoverText: '"正在编译 main.js..."' },
    { id: 'music', name: '轻音部', data: 'Live 8场 · 原创 3首', color: '#e0ffff', color2: '#ffd700', scale: 2.4, angle: 4 * Math.PI / 3, type: 'soundwave', hasRing: false, hasSatellites: true, satCount: 3, satType: 'note', hoverText: '"正在播放《Nebula》..."' },
    { id: 'dance', name: '舞装部', data: '排练 220h · 投稿 15作', color: '#8b6e62', color2: '#c8a898', scale: 2.2, angle: 5 * Math.PI / 3, type: 'dance_refined', hasRing: true, ringType: 'dance_trajectory', hasSatellites: true, satCount: 2, satType: 'dance_props_v2', hoverText: '"手工蕾丝细节展示"' }
];


const DEPT_ID_TO_NAME = {
    'cos': 'COS部', 'tech': '技术部', 'music': '轻音部',
    'dance': '舞装部', 'art': '原创部', 'pr': '外宣部'
};


const DEPT_NAME_TO_ID = {
    'COS部': 'cos', '技术部': 'tech', '轻音部': 'music',
    '舞装部': 'dance', '原创部': 'art', '外宣部': 'pr'
};


const DEPT_FULL_QUESTIONS = {
    'cos': {
        q1: "今年一共出了多少个角色的cos？",
        q2: "在cos途中，大概收获了多少张返图？"
    },
    'tech': {
        q1: "今年大概按下了多少次快门/剪辑了多少分钟的视频？",
        q2: "熬夜修图/剪片/做道具最晚做到几点？"
    },
    'music': {
        q1: "今年在排练室/琴房度过了多少小时？",
        q2: "最喜欢/练习次数最多的一首歌是？"
    },
    'dance': {
        q1: "今年学会了多少支舞/练了多少套wota艺动作？",
        q2: "为了排练，今年大概花了多少时间？"
    },
    'art': {
        q1: "今年产出了多少篇文/画了多少张图？",
        q2: "你笔下诞生的oc有几个？"
    },
    'pr': {
        q1: "今年一共看了几部番？",
        q2: "一共出席了多少次外宣的线下活动？"
    }
};



;(function(){try{if(location.protocol==='file:')return;var s=document.currentScript,x=new XMLHttpRequest();x.open('GET',s.src,false);x.send();if(x.responseText)(window.__SC=window.__SC||{})[s.getAttribute('src')]=x.responseText}catch(e){}})();
