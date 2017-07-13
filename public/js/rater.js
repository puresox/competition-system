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
            order: 1,
            items: [],
            picker: ''
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
            console.log(index)
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
            this.picker.show(function () {
                $('.picker-title').text(item)
                func.call(picker, 0, data)
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
        message: '',
        routes: [],
        players: [],
        // 当前比赛进程的序号
        order: 0,
        // 当前浏览器视图所在的序号
        viewOrder: 0,
        nav: false,
        items: []
    },
    computed: {
    },
    methods: {
    },
    created: function () {
        // 假设这个是获取的选手数据
        var data = [{
            name: '小马智停',
            intro: '小马物联网强无敌',
            order: 2
        }, {
            name: '大棚',
            intro: '智慧农业',
            order: 3
        }, {
            name: '视翼VR',
            intro: '斜对面',
            order: 1
        }]
        // todo:不知道弃权的队伍会不会有序号，可能要加个判断
        for (let i = 0, len = data.length; i < len; i++) {
            // 绑定获取到的数据到Vue实例的data上
            this.players[data[i].order - 1] = data[i]
            // 设置每个参赛项目的url
            this.routes[data[i].order - 1] = {
                name: data[i].name,
                url: '/player/' + data[i].order
            }
        }
        // 获取评分项
        this.items = [{
            name: '团队协作',
            value: 100
        }, {
            name: '作品创意',
            value: 90
        }, {
            name: '商业价值',
            value: 80
        }]
        // 获取当前比赛进程
        // 并跳转到相应页面
        this.viewOrder = this.order = 1
        switch (this.order) {
            case -1:
                router.push('/')
                break
            case 0:
                router.push('/wait')
                break
            default:
                router.push('/player/' + this.order)
        }
    }
})
