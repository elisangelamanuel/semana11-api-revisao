const { v4: uuidv4 } = require("uuid");
const moment = require("moment");
const clientsBankAccount = require("../model/modified-structure-clients-bank-account.json");

const create = (req, res) => {
  const { nome_cliente, cpf_cliente, data_nascimento, conta: { tipo: { tipo_conta } } } = req.body;

  if (tipo_conta != "corrente" && tipo_conta != "poupança" && tipo_conta != "investimento") {
    return res.status(400).res.json({ message: "Account type is not defined" });
  };

  if (cpf_cliente.length != 11) {
    return res.status(400).res.json({ message: "CPF number must have 11 digits" });
  };

  let formatDate = moment(data_nascimento, "MM/DD/YYYY").format("l");

  if (formatDate == "Invalid date") {
    return res.status(400).res.json({ message: "Invalid date" });
  };

  const newClientId = {
    id: uuidv4(),
    nome_cliente,
    cpf_cliente,
    data_nascimento: moment(data_nascimento).format("l"),
    conta: {
      numero: moment().unix(),
      tipo: {
        tipo_conta: tipo_conta,
        transacao_entrada: 0,
        transacao_saida: 0,
      },
      saldo: 0,
      data_criacao: moment().format(),
    },
  };

  clientsBankAccount.push(newClientId);

  return res.status(201).json({ ...newClientId });

};

const read = (req, res) => {
  const filterName = req.query.name;
  const filterType = req.query.type;

  const filterClient = clientsBankAccount.filter((client) => {
    if (filterName) {
      return client.nome_cliente.toLowerCase() == filterName.toLowerCase();
    };

    if (filterType) {
      return client.conta.tipo.tipo_conta.toLowerCase() == filterType.toLowerCase();
    };
    
    return client;
  });

  const empty = [];
  if (filterClient.length == empty.length) {
    res.status(404).res.json({ message: "Data not found" });
  };

  if (filterClient) {
    return res.status(200).json(filterClient);
  };
};

const update = (req, res) => {
  const clientID = req.params.id;
  let { data_nascimento } = req.body;
  let findID = clientsBankAccount.find((ID) => ID.id == clientID);

  if (findID) {

    if (data_nascimento) {
      let formatDate = moment(data_nascimento, "MM/DD/YYYY").format("l");

      if (formatDate == "Invalid date") {
        return res.status(400).res.json({ message: "Invalid date" });
      };

      const updatedBirthday = {
        ...findID,
        data_nascimento: moment(data_nascimento).format("l"),
      };

      clientsBankAccount.map((client, index) => {
        if (client.id == clientID) {
          clientsBankAccount[index] = updatedBirthday;
        }
      });

      return res.status(200).json({
        message: `Date has been updated`,
      });
    }

    if (!data_nascimento) {
      return res.status(400).json({ message: "Invalid date" });
    }
  }
};

const destroy = (req, res) => {
  const idForDelete = req.params.id
  const findUser = clientsBankAccount.find((user) => user.id === idForDelete)

  if (findUser) {
    clientsBankAccount.map((user, index) => {
      if (user.id === idForDelete) {
        return clientsBankAccount.splice(index, 1)
      }
    })

    return res.status(200).json({ message: "That account has been deleted from the server" })
  }

  return res.status(404).json({
    message: "ID not Found"
  })
};

module.exports = {
  create, read, update, destroy
}