var socket = io()
// 加载组件
const load = {
    props: ['load'],
    template: '#load'
}
// 等待组件
const wait = {
    props: ['wait'],
    template: '#wait'
}
// 选手信息组件
const player = {
    props: ['players', 'pitems'],
    template: '#player',
    data: function () {
        return {
            playerData: '',
            order: 0,
            items: [],
            // 筛选器
            picker: '',
            itemIndex: 0
        }
    },
    computed: {
        // todo:后期可能要加个改变样式
        prePlayer: function () {
            var order = parseInt(this.$route.params.order)
            return '/player/' + (order > 1 ? order - 1 : 1)
        },
        nextPlayer: function () {
            var order = parseInt(this.$route.params.order)
            return '/player/' + (order < this.players.length ? order + 1 : this.players.length)
        }
    },
    created: function () {
        this.playerData = this.players[this.$route.params.order - 1]
        this.items = this.pitems
        this.order = this.$route.params.order
        // 生成筛选器
        let data = []
        for (let i = 0; i < 100; i++) {
            data[i] = {
                text: (i + 1).toString(),
                value: (i + 1)
            }
        }
        this.picker = new Picker({
            data: [data],
            selectedIndex: [0],
            title: '请选择分数'
        })
        let self = this
        this.picker.on('picker.select', function (selectedVal, selectedIndex) {
            // 将选择结果传递回父组件
            self.$emit('select', selectedVal[0], self.itemIndex)
        })
    },
    // 监听路由的变化
    watch: {
        '$route': 'updateData'
    },
    methods: {
        updateData: function () {
            this.playerData = this.players[this.$route.params.order - 1]
            this.order = this.$route.params.order
        },
        // todo:如果有未打分项,不给提交并提示
        select: function (index) {
            // 按照该项的最高分重新填充筛选器
            let data = []
            for (let i = 0, len = this.items[index].value; i < len; i++) {
                data[i] = {
                    text: (i + 1).toString(),
                    value: (i + 1)
                }
            }
            let picker = this.picker
            let func = this.picker.refillColumn
            let item = this.items[index].name
            // 显示筛选器并重新填东西
            this.picker.show(function () {
                $('.picker-title').text(item)
                func.call(picker, 0, data)
            })
            this.itemIndex = index
        },
        submit: function () {
            // todo:1.未填分数确认2.分数弹窗再次确认
            let self = this
            $.ajax({
                url: '/api/raters/score/' + self.playerData._id,
                type: 'post',
                data: {
                    scores: JSON.stringify(self.playerData.scores)
                },
                success: function (msg) {
                    console.log(msg)
                },
                error: function (err) {
                    console.log('提交失败')
                }
            })
        }
    }
}

// 路由
const router = new VueRouter({
    routes: [
        // 默认页面,加载中
        { path: '/', component: load },
        // 等待页,等待抽签完成
        { path: '/wait', component: wait },
        // 评分页,对各个项目进行评分
        { path: '/player/:order', component: player }
    ]
})

var vue = new Vue({
    router,
    el: '#spa',
    data: {
        // 路由
        routes: [],
        // 参赛项目
        players: [],
        // 评分项
        items: [],
        // 分数
        scores: [],
        // 当前进行到的项目的序号
        participant: 0,
        // 当前比赛状态
        status: -1,
        // 当前浏览器视图所在的序号（估计没用）
        viewOrder: 0,
        // 预留, 暂时没用
        message: '',
        // 显示导航栏(暂时没用)
        nav: false
    },
    computed: {
    },
    methods: {
        selectScore: function (score, index) {
            this.players[this.participant].scores[index].score = score
        }
    },
    beforeCreate: function () {
        router.push('/')
    },
    created: function () {
        var self = this
        $.ajax({
            url: '/api/raters/status',
            type: 'get',
            success: function (msg) {
                console.log(msg)
                for (let i = 0, len = msg.message.participants.length; i < len; i++) {
                    // 绑定获取到的数据到Vue实例的players上
                    self.players[msg.message.participants[i].order - 1] = msg.message.participants[i]
                    // 设置每个参赛项目的url
                    self.routes[msg.message.participants[i].order - 1] = {
                        name: msg.message.participants[i].name,
                        url: '/player/' + msg.message.participants[i].order
                    }
                }
                // 获取评分项
                self.items = msg.message.items
                // 初始化每个player的scores
                for (let i = 0, len = self.players.length; i < len; i++) {
                    self.players[i].scores = []
                    for (let i2 = 0, len2 = self.items.length; i2 < len2; i2++) {
                        self.players[i].scores[i2] = {
                            item: self.items[i2]._id,
                            score: 0
                        }
                    }
                }
                let scores = msg.message.scores
                // 获取选手成绩(神奇的后端居然没直接放进participants里要前端自己放!)
                for (let i = 0, len = scores.length; i < len; i++) {
                    // 遍历所有成绩并匹配参赛作品
                    for (let i2 = 0, len2 = self.players.length; i2 < len2 && self.players[i2]._id == scores[i].participant; i2++) {
                        // 匹配对应player中的成绩项
                        for (let i3 = 0, len3 = self.players[i2].scores.length; i3 < len3; i3++) {
                            for (let i4 = 0, len4 = scores[i].scores.length; i4 < len4 && self.players[i2].scores[i3].item == scores[i].scores[i4].item; i4++) {
                                self.players[i2].scores[i3].score = scores[i].scores[i4].score
                            }
                        }
                    }
                }
                // 获取当前比赛进程
                // 并跳转到相应页面
                self.status = msg.message.status
                self.participant = msg.message.participant
                switch (self.status) {
                    case -1:
                        router.push('/')
                        break
                    case 0:
                        // 未开始,等待抽签
                        router.push('/wait')
                        break
                    case 1:
                        // 抽签完了,主持人没点开始
                        router.push('/wait')
                        break
                    case 2:
                        // 比赛正式开始
                        // 跳转到响应的选手页
                        switch (self.participant) {
                            default: router.push('/player/' + (self.participant + 1))
                        }
                        break
                    case 3:
                        // 比赛结束
                        break
                    default:
                }
            },
            error: function (err) {
                console.log(err)
            }
        })
    }
})
