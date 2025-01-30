let cart = [];
let cartCount = document.getElementById('cart-count');
let cartItemsContainer = document.getElementById('cart-items');
let cartSubtotal = document.getElementById('cart-subtotal');
let cartShipping = document.getElementById('cart-shipping');
let cartTotal = document.getElementById('cart-total');

// Variável para contar os cliques no cabeçalho
let clickCount = 0;

// Função para lidar com os cliques no cabeçalho
document.querySelector('header').addEventListener('click', function() {
    clickCount++; // Incrementa o contador de cliques

    // Verifica se o número de cliques chegou a 5
    if (clickCount >= 5) {
        // Torna o botão de login visível
        document.querySelector('.admin-btn').style.display = 'block';
    }
});

// Adiciona um item ao carrinho
function addToCart(productName, price) {
    cart.push({ name: productName, price: price });
    cartCount.textContent = cart.length;
    updateCartItems();
}

// Função para remover um item do carrinho
function removeFromCart(index) {
    cart.splice(index, 1); // Remove o item do carrinho pelo índice
    cartCount.textContent = cart.length;
    updateCartItems(); // Atualiza a lista do carrinho
}

// Atualiza os itens do carrinho no modal
function updateCartItems() {
    cartItemsContainer.innerHTML = ''; // Limpa a lista de itens

    let subtotal = 0;

    cart.forEach((item, index) => {
        subtotal += item.price;
        cartItemsContainer.innerHTML += `
            <div class="cart-item">
                <span class="cart-item-name">${item.name}</span>
                <span class="cart-item-price">R$${item.price.toFixed(2)}</span>
                <button onclick="removeFromCart(${index})">Remover</button> <!-- Botão de remoção -->
            </div>
        `;
    });

    // Exibe o subtotal, o frete e o total
    cartSubtotal.textContent = `R$${subtotal.toFixed(2)}`;
    let shipping = 2; // Valor fixo de frete
    cartShipping.textContent = `R$${shipping.toFixed(2)}`;
    cartTotal.textContent = `R$${(subtotal + shipping).toFixed(2)}`;
}

// Função para buscar o endereço automaticamente pelo CEP
function buscarEndereco() {
    const cep = document.getElementById('cep').value.replace(/\D/g, ''); // Remove tudo que não for número
    if (cep.length === 8) {
        fetch(`https://viacep.com.br/ws/${cep}/json/`)
            .then(response => response.json())
            .then(data => {
                if (data.erro) {
                    alert('CEP não encontrado.');
                } else {
                    document.getElementById('logradouro').value = data.logradouro;
                    document.getElementById('bairro').value = data.bairro;
                    document.getElementById('cidade').value = data.localidade;
                    document.getElementById('estado').value = data.uf;
                }
            })
            .catch(error => {
                console.error('Erro ao buscar o CEP:', error);
                alert('Erro ao buscar o endereço. Tente novamente.');
            });
    } else {
        alert('Por favor, insira um CEP válido.');
        
    }
}

// Abre o modal do carrinho
function openCart() {
    document.getElementById('cart-modal').style.display = 'flex';
}

// Fecha o modal do carrinho
function closeCart() {
    document.getElementById('cart-modal').style.display = 'none';
}

// Função de login do administrador
function openLoginModal() {
    document.getElementById('login-modal').style.display = 'flex';
}

function closeLoginModal() {
    document.getElementById('login-modal').style.display = 'none';
}

// Verifica o login do administrador
document.getElementById('login-form').addEventListener('submit', function(event) {
    event.preventDefault();
    
    const username = document.getElementById('admin-user').value;
    const password = document.getElementById('admin-pass').value;

    if (username === 'admin' && password === 'admin123') {
        // Login bem-sucedido, exibe a área de pedidos
        alert('Login realizado com sucesso!');
        closeLoginModal();
        loadAdminOrders();  // Carrega os pedidos
    } else {
        alert('Usuário ou senha incorretos');
    }
});



document.getElementById('cpf').addEventListener('input', function(e) {
    var value = e.target.value;
    var cpfPattern = value.replace(/\D/g, '') // Remove qualquer coisa que não seja número
                          .replace(/(\d{3})(\d)/, '$1.$2') // Adiciona ponto após o terceiro dígito
                          .replace(/(\d{3})(\d)/, '$1.$2') // Adiciona ponto após o sexto dígito
                          .replace(/(\d{3})(\d)/, '$1-$2') // Adiciona traço após o nono dígito
                          .replace(/(-\d{2})\d+?$/, '$1'); // Impede entrada de mais de 11 dígitos
    e.target.value = cpfPattern;
  });

// Armazena os pedidos no localStorage
document.getElementById('checkout-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const name = document.getElementById('name').value;
    const cpf = document.getElementById('cpf').value;
    const cep = document.getElementById('cep').value;
    const numero = document.getElementById('numero').value;
    const complemento = document.getElementById('complemento').value;
    const payment = document.getElementById('payment').value;

    // Validação dos campos
    if (!name || !cpf || !cep || !numero) {
        alert('Por favor, preencha todos os campos obrigatórios.');
        return;
    }

    if (!/^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(cpf)) {
        console.log("CPF inválido!");
    }

    // Calcular o valor total dos itens
    const total = cart.reduce((total, item) => total + item.price, 0);
    const shipping = 10; // Valor fixo de frete
    const finalTotal = total + shipping;

    // Gerar a mensagem para WhatsApp
    const message = `
        *Pedido:*\n${cart.map(item => `- ${item.name} (R$${item.price.toFixed(2)})`).join('\n')}

        ----------------------------------------------------

        \n\n*Total: R$${finalTotal.toFixed(2)}*

        ----------------------------------------------------

        \n\n*Informações do Cliente:*
        \nNome: ${name}
        \nCPF: ${cpf}
        \nCEP: ${cep}
        \nEndereço: ${document.getElementById('logradouro').value}, ${numero} - ${complemento}
        \nBairro: ${document.getElementById('bairro').value}
        \nCidade: ${document.getElementById('cidade').value}
        \nEstado: ${document.getElementById('estado').value}

        ----------------------------------------------------

        \nPagamento: ${payment}
    `;

    // Gerar o link do WhatsApp
    const whatsappLink = `https://wa.me/+5585992138755?text=${encodeURIComponent(message)}`;

    // Abrir o WhatsApp com a mensagem
    window.open(whatsappLink, '_blank');

    alert('Pedido enviado com sucesso!');

    // Limpar carrinho após o pedido
    cart = [];
    cartCount.textContent = 0;
    updateCartItems();
});

// Carrega os pedidos feitos para visualização do admin
function loadAdminOrders() {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const tableBody = document.getElementById('orders-table').getElementsByTagName('tbody')[0];
    tableBody.innerHTML = ''; // Limpa a tabela

    orders.forEach(order => {
        const row = tableBody.insertRow();
        row.insertCell(0).textContent = order.date;
        row.insertCell(1).textContent = order.cpf;
        row.insertCell(2).textContent = order.items.map(item => item.name).join(', ');
    });

    document.getElementById('admin-orders').style.display = 'flex';
}

// Fecha a visualização dos pedidos
function closeAdminOrders() {
    document.getElementById('admin-orders').style.display = 'none';
}
