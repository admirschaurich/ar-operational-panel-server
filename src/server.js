var port = process.env.PORT || 5555;

const express = require('express');
//require('dotenv').config();
const ordemServicoData = require('../src/data/ordemServicoData');
const app = express();
const serverHttp = require('http').createServer(app);
const io = require('socket.io')(serverHttp, {
    cors: {
        origin: '*',
        credentials: true
    }
});

app.use(express.json());

let interval = null;
let time = 10000;//180000 = 3 minutos | 600000 = 10 minutos | 900000 = 15 minutos | 
let running = false;
let date = new Date();
app.get('/changeDate/:date', (req, res) => {
    reqDate = req.params.date;
    //date = `${reqDate.substring(0,2)}/${reqDate.substring(2,4)}/${reqDate.substring(4,8)}`;
    date = new Date(reqDate.substring(4, 8), reqDate.substring(2, 4) - 1, reqDate.substring(0, 2))
    console.log(`A data foi alterada: ${date.toLocaleDateString()}`);
    res.send(`A nova data é: ${date.toLocaleDateString()}`);
})
app.get('/getServiceOrders/:date', async (req, res) => {
    reqDate = req.params.date;
    //date = `${date.substring(0,2)}/${date.substring(2,4)}/${date.substring(4,8)}`;
    date = new Date(reqDate.substring(4, 8), reqDate.substring(2, 4) - 1, reqDate.substring(0, 2))
    console.log(`Data: ${date}`);
    let retorno = {
        dateQuery: date,
        success: false,
        totalRegisters: 0,
        message: '',
        error: null,
        data: null,
        date: new Date()
    }

    try {
        console.log(`Executando a consulta em ordemServicoData.getOrdensServicoPainel(${date})`)
        var a = await ordemServicoData.getOrdensServicoPainelSemModeloOS(date);
        retorno.success = true;
        retorno.message = `Foram encontrados: ${a.length} registros`;
        retorno.totalRegisters = a.length;
        // retorno.data = JSON.parse(a);
        retorno.data = a;
    }
    catch (err) {
        console.log(`Houve um erro: ${err}`)
        retorno.message = `A requisição encontrou um erro`;
        retorno.error = err;
    }
    //console.log(a);
    res.json(retorno);
})
app.get('/', (req, res) => {
    res.send(`${new Date().toLocaleString('pt-BR')} - Servidor sendo executado na porta ${port}`);
})
serverHttp.listen(port, () => {
    console.log(`${new Date().toLocaleString('pt-BR')} - Servidor sendo executado na porta ${port}`);
    run();
});
async function execute() {
    running != running;
    var xc =  await processDataForDate(new Date());
    console.log(xc);
    if (clients.length > 0) {
        //Varre a lista de clients conectados, e agrupa por data de escuta de cada cliente
        const datesForQuery = clients.reduce((grupo, registro) => {
            const { datequery } = registro;
            grupo[datequery] = grupo[datequery] ?? [];
            grupo[datequery].push(registro);
            return grupo;
        }, {});

    
        for (const item of Object.entries(datesForQuery)) {
            console.log(item[0]);
            const dateForQuery = new Date(item[0]);//Converte para o formato data
            var dayAndDayMoreOneData = await processDataForDate(dateForQuery);//Executa a função para fazer a consulta no banco de dados

            console.log(`Enviando dados para os clientes da Room: ${dateForQuery.toLocaleDateString('pt-BR')}`);
            io.to(dateForQuery.toLocaleDateString('pt-BR')).emit('refreshData', dayAndDayMoreOneData);
            for (const subItem of Object.entries(item[1])) {
                console.log(`---ID: ${subItem[1].socketid}`);
            }
        }

        //Varre a lista de datas agrupadas por cliente, para fazer as consultas e disparar a atualização para os clientes certos
        // Object.entries(datesForQuery).forEach(element => {
        //     console.log(`-Data: ${element[0]}`);
        //     const dateForQuery = new Date(element[0]);//Converte para o formato data
        //     console.log(dateForQuery);
        //     //var dayAndDayMoreOneData = await processDataForDate(dateForQuery);
        //     console.log(dayAndDayMoreOneData);
            
        //     Object.entries(element[1]).forEach(subElement =>{
        //         console.log(`---ID: ${subElement[1].socketid}`);
        //     })
        // });

    }
    else{
        console.log(`${new Date().toLocaleString('pt-BR')} - Nenhum cliente conectado. Abortando a atualização de dados`)
    }

    //var todayAndTomorrowData = await processDataForDate(date);
    //await updateDataClientsPanels(todayAndTomorrowData);

    //#region  Gerador de data aleatória para testes
    // let startDate = new Date(2022,9,6);
    // let endDate = new Date();
    // date = new Date(startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime()));
    // console.log(`${new Date().toLocaleString('pt-BR')} - Data alterada para: ${date.toLocaleDateString()}`);
    //#endregion
    running != running;
}
async function processDataForDate(_date) {
    console.log(`${new Date().toLocaleString('pt-BR')} - Iniciando a verificação de dados para a data: ${_date.toLocaleDateString()}`);

    let retorno = {
        dateQuery: _date.toLocaleDateString(),
        success: false,
        totalRegisters: 0,
        message: '',
        error: null,
        data: null,
        date: new Date()
    }

    try {
        //var a = await ordemServicoData.getOrdensServicoPainelSemModeloOS(_date);
        //var a = await ordemServicoData.getOrdensServicoPainelSemModeloOSHojeEAmanha(date);
        var a = await ordemServicoData.getOrdensServicoPainel(_date);
        retorno.success = true;
        retorno.message = `Foram encontrados: ${a.length} registros`;
        retorno.totalRegisters = a.length;
        retorno.data = a;
    }
    catch (err) {
        retorno.message = `A requisição encontrou um erro`;
        retorno.error = err;
    }
    console.log(`${new Date().toLocaleString('pt-BR')} - Fim da verificação`);
    //console.log(retorno);
    return retorno;
}
async function run() {
    if (interval != null) {
        //utils.log(debug_log=true, 'Existe um intervalo criado e será eliminado!');
        clearInterval(interval);
        //utils.log(debug_log=true, 'Intervalo eliminado');
    }
    else {
        //utils.log(debug_log=true, 'Não existe nenhum intervalo!');
    }
    //utils.log(debug_log=true, 'run');
    interval = setInterval(() => {
        if (!running) {
            execute();
        }
        else {
            console.log(`${new Date().toLocaleString('pt-BR')} - Existe um processo em execução, aguardando finalizar`);
        }
    }, time);
    //utils.log(debug_log=true, 'Novo intervalo criado!');
}
async function updateDataClientsPanels(_todayAndTomorrowData) {
    if (clients.length > 0) {
        console.log(`${new Date().toLocaleString('pt-BR')} - Atualizando os paineis clientes: ${clients.length}`)
        //console.log(_todayData);
        io.emit('refreshData', _todayAndTomorrowData);
    }
    else{
        console.log(`${new Date().toLocaleString('pt-BR')} - Nenhum cliente conectado. Abortando a atualização de dados`)
    }
}
//#region Socket IO
let clients = [];//Lista com todos os clientes conectados e com os parâmetros de cada um
var socket;
io.on('connection', socket => {
    console.log(`${new Date().toLocaleString('pt-BR')} - Novo painel da regional ${socket.handshake.query.regional} conectado, com o id: ${socket.id}, token: ${socket.handshake.auth.token}`);
    console.log(`dataQuery: ${socket.handshake.query.dateQuery}`)
    var arrayDate = socket.handshake.query.dateQuery.split('-');
    var dt = new Date(parseInt(arrayDate[0]),parseInt(arrayDate[1])-1, parseInt(arrayDate[2]))
    let _client = {
        socketid: socket.id,
        datequery: dt, //o painel Cliente informa qual data base ele vai ficar esperando dados, isso permite abrir mais paineis com datas diferentes
        date: new Date()
    }
    clients.push(_client);
    ;//Formata a data no formato correto, para poder usar o toLocaleDateString
    console.log(`Adicionando o cliente na Room: ${dt.toLocaleDateString('pt-BR')}`);
    socket.join(dt.toLocaleDateString('pt-BR'));//Adiciona o cliente em uma room com no nome da data, isso servirá para depois enviar os dados por room de datas

    console.log(`${new Date().toLocaleString('pt-BR')} - Clientes conectados: ${clients.length}`)

    socket.on('disconnect', () => {
        console.log(`${new Date().toLocaleString('pt-BR')} - Cliente DESCONECTADO: ${socket.id}`);
        clients = clients.filter(x => x.socketid != socket.id);//Remove o computador da lista
        console.log(`${new Date().toLocaleString('pt-BR')} - Clientes conectados: ${clients.length}`)
    })

});
//#endregion 