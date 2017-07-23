var socket = io.connect('/host')
// 加载组件
const load = {
    props: ['load'],
    template: '#load'
}
// 抽签组件
const random = {
    props: ['players', 'btns'],
    template: '#random',
    data: function () {
        return {
            modeSelect: true,
            auto: false,
            manual: false,
            swaping: false,
            swapFrom: {
                index: -1,
                obj: {}
            },
            swapTo: {
                index: -1,
                obj: {}
            },
            swapPrompt: '选择要换位置参赛项目'
        }
    },
    computed: {
        randomStyle: function () {
            return this.btns.random ? 'btn-random' : 'btn-random--disable'
        }
    },
    methods: {
        getRandom: function () {
            // todo:可能会抽签失败
            if (!confirm('是否开始自动抽签?')) {
                return
            }
            socket.emit('autoDraw')
        },
        postOrder: function () {
            if (!confirm('是否提交该抽签结果')) {
                return
            }
            var result = []
            for (let i = 0, len = this.players.length; i < len; i++) {
                result[i] = {
                    id: this.players[i]._id,
                    order: this.players[i].order
                }
            }
            let self = this
            $.ajax({
                url: '/api/hosts/draw',
                type: 'post',
                data: {
                    participants: JSON.stringify(result)
                },
                success: function () {
                    socket.emit('manuDrawn')
                    vue.btnStatus.begin = true
                    vue.btnStatus.random = false
                    self.manual = false
                },
                error: function () {

                }
            })
        },
        beginMatch: function () {
            if (!confirm('是否开始比赛?')) {
                return
            }
            let self = this
            // 告诉后台开始比赛/下一个选手
            $.ajax({
                url: '/api/hosts/beginCompetition',
                type: 'post',
                success: function (msg) {
                    vue.status = 2
                    vue.participant++
                    vue.score = 0
                    console.log('比赛开始')
                    router.push('/matching')
                    // 发送socket
                    socket.emit('nextParticipant')
                },
                error: function (err) {
                    alert('网络发生错误,请求失败,请再次点击"开始比赛"')
                }
            })
        },
        autoMode: function () {
            this.auto = true
        },
        manualMode: function () {
            this.manual = true
            this.btns.random = false
        },
        getModal: function () {
            this.$emit('getmodal', {
                type: 1,
                method: 1,
                content: '测试'
            })
        },
        backRandom: function () {
            this.btns.random = true
            this.manual = false
        },
        selectItem: function (index) {
            // 选中了一个
            if (!this.swaping) {
                this.swaping = true
                this.swapFrom.obj = this.players[index]
                this.swapFrom.index = index

                this.swapPrompt = '将选中项目移动至'
            } else {
                // 再选另一个
                this.swaping = false
                this.swapTo.obj = this.players[index]
                this.swapTo.index = index
                vue.players[this.swapTo.index].order = this.swapFrom.index + 1
                vue.players[this.swapFrom.index].order = this.swapTo.index + 1
                Vue.set(vue.players, this.swapTo.index, this.swapFrom.obj)
                Vue.set(vue.players, this.swapFrom.index, this.swapTo.obj)
                this.swapPrompt = '选择要换位置参赛项目'
            }
        }
    }
}
// 比赛中的组件
const matching = {
    props: ['players', 'btns', 'order'],
    template: '#matching',
    data: function () {
        return {
            timing: true
        }
    },
    computed: {
        getLogo: function () {
            return '../competition/' + this.players[this.order - 1].logo
        }
    },
    methods: {
        beginScoring: function () {
            if (!confirm('是否开始评分?')) {
                return
            }
            // todo:开始打分成功之后按钮的变化
            let self = this
            $.ajax({
                url: '/api/hosts/beginScore',
                type: 'post',
                success: function (msg) {
                    console.log(msg)
                    // 发送socket
                    socket.emit('beginScore')
                    vue.btnStatus.score = false
                    vue.btnStatus.scoring = true
                },
                error: function (err) {
                    alert('网络发生错误,请再次点击"开始打分"')
                }
            })
        },
        nextParticipant: function () {
            if (!confirm('是否进行下一组')) {
                return
            }
            let self = this
            // 告诉后台开始比赛/下一个选手
            // todo:等screen通知之后才出现下一个
            $.ajax({
                url: '/api/hosts/beginParticipant',
                type: 'post',
                success: function (msg) {

                    // 拉取状态
                    vue.status = 2
                    vue.participant++
                    vue.score = 0
                    vue.btnStatus.score = true
                    vue.btnStatus.scoring = false
                    vue.btnStatus.next = false
                    console.log('下一个选手')
                    // 发送socket
                    socket.emit('nextParticipant')
                },
                error: function (err) {
                    alert('网络发生错误,请再次点击')
                    console.log('下一个选手失败')
                }
            })
        },
        beginTiming: function () {
            this.timing = false
            socket.emit('countDown')
        },
        stopTiming: function () {
            this.timing = true
            socket.emit('endCountDown')
        },
        overMatch: function () {
            if (!confirm('是否结束比赛?')) {
                return
            }
            $.ajax({
                url: '/api/hosts/endCompetition',
                type: 'post',
                success: function () {
                    socket.emit('end')
                    router.push('/over')
                },
                error: function () {
                    alert('结束比赛失败,请点击重试')
                }
            })

        }
    }
}

const over = {
    props: ['over'],
    template: '#over'
}

var router = new VueRouter({
    routes: [
        // 默认页面,加载中
        { path: '/', component: load },
        // 控制抽签页面
        { path: '/random', component: random },
        // 控制评分页
        { path: '/matching', component: matching },
        // 结束页面
        { path: '/over', component: over }
    ]
})

var vue = new Vue({
    router,
    el: '#spa',
    data: {
        message: '',
        order: 0,
        // 当前进行到的项目的序号
        participant: 0,
        // 当前比赛状态
        status: -1,
        // 参赛选手
        players: [],
        // 按钮状态
        btnStatus: {
            random: true,
            begin: false,
            // 打分
            score: true,
            // 打分中
            scoring: false,
            // 下一组
            next: false,
            // 结束比赛
            over: false
        },
        modal: {
            doing: false,
            query: false,
            prompt: false,
            modalContent: '',
            methodIndex: 0
        }
    },
    computed: {
        modalshow: function () {
            if (this.doing || this.query || this.prompt) {
                return true
            } else {
                return false
            }
        }
    },
    methods: {
        add: function (msg) {
            console.log(msg)
        },
        showModel: function (setting) {
            switch (setting.type) {
                case 1:
                    this.showDoing(setting)
                    break
                case 2:
                    this.showQuery(setting)
                    break
                case 3:
                    this.showPrompt(setting)
                    break
            }
        },
        showDoing: function (data) {
            this.modalContent = data.content
            this.modal.doing = true
        },
        showQuery: function (data) {
            this.modal.query = true
            this.modal.methodIndex = data.method
        },
        showPrompt: function (data) {
            this.modal.prompt = true
        },
        useChileMethod: function (index) {

        }
    },
    beforeCreate: function () {
        router.push('/')
    },
    created: function () {
        let self = this
        $.ajax({
            url: '/api/hosts/status',
            type: 'get',
            success: function (data) {
                // todo:
                // 1.判断success
                // 2.如果失败怎么办
                // 3.不知道弃权的队伍会不会有序号，可能要加个判断
                // 4.没有参赛队伍的情况
                console.log(data)
                // 获取比赛进程
                self.status = data.message.status
                self.participant = data.message.participant
                self.score = data.message.score
                // 还没开始抽签
                self.players = data.message.participants
                if (self.status == 0) {
                    for (let i = 0, len = data.message.participants.length; i < len; i++) {
                        self.players[i].order = i + 1
                    }
                }
                // 绑定获取到的数据到Vue实例的data上
                for (let i = 0, len = data.message.participants.length; i < len; i++) {
                    self.players[data.message.participants[i].order - 1] = data.message.participants[i]
                }
                if (self.score == 0) {
                    self.btnStatus.score = true
                    self.btnStatus.scoring = false
                    self.btnStatus.next = false
                } else if (self.score == 1) {
                    self.btnStatus.score = false
                    self.btnStatus.scoring = true
                    self.btnStatus.next = false
                } else if (self.score == 2) {
                    self.btnStatus.score = false
                    self.btnStatus.scoring = false
                    self.btnStatus.next = true
                }
                // 结束比赛按钮
                if (vue.participant + 1 > vue.players.length) {
                    vue.btnStatus.over = true
                }

                // 跳转到相应页面
                switch (self.status) {
                    case -1:
                        // 加载中(默认)
                        router.push('/')
                        break
                    case 0:
                        // 比赛未开始
                        router.push('/random')
                        break
                    case 1:
                        // 抽签结束，比赛可以开始
                        vue.btnStatus.begin = true
                        vue.btnStatus.random = false
                        router.push('/random')
                        break
                    case 2:
                        // 比赛开始
                        router.push('/matching')
                        break
                    case 3:
                        // 比赛结束
                        router.push('/over')
                }
            },
            error: function () {
                alert('从系统获取数据失败,点击确定重新加载')
                window.location.reload()
                console.log('error')
            }
        })
    }
})
// 监听抽签结束
socket.on('autoDrawn', function () {
    $.ajax({
        url: '/api/hosts/status',
        type: 'get',
        success: function (data) {
            // 获取比赛进程
            vue.status = data.message.status
            vue.participant = data.message.participant
            vue.score = data.message.score
            // 绑定获取到的数据到Vue实例的data上
            for (let i = 0, len = data.message.participants.length; i < len; i++) {
                vue.players[data.message.participants[i].order - 1] = data.message.participants[i]
            }
            // 改变按钮状态
            // todo:改变按钮状态这个,也要弄一个在created拉取状态的时候去赋值
            vue.btnStatus.begin = true
            vue.btnStatus.random = false
        },
        error: function (err) {
            alert('获取抽签结果失败,点击确定按钮刷新页面')
            window.location.reload()
        }
    })
})
// 监听评分结束
socket.on('endParticipant', function () {
    vue.btnStatus.score = false
    vue.btnStatus.scoring = false
    if (vue.participant + 1 > vue.players.length) {
        vue.btnStatus.next = false
        vue.btnStatus.over = true
    } else {
        vue.btnStatus.next = true
        vue.btnStatus.over = false
    }
})