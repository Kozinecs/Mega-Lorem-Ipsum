window.onload = function () {
    const
        url = 'http://localhost:1337/tables',
        get = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        }

    // Get all data

    async function getTableData() {
        const response = await fetch(url + '?_limit=300', get)
            .then((response) => {
                return response.json();
            })
            .then((data) => {
                console.log(data);
                let test = ['',];
                data.forEach((el) => {
                    test.push(el);
                })
                return (test);
            })
            .catch(error => console.log(error));

        return response;
    }

    // API Create new item

    async function postData(data = {}) {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })

        return await response.json();
    }

    // API update item

    async function updateData(id, data = {}) {
        const response = await fetch(url + '/' + id, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })

        return await response.json();
    }

    // API delete item

    async function deleteData(id) {
        const response = await fetch(url + '/' + id, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        })

        return await response.json();
    }

    // Generate cells and rows

    function generateRows(table) {
        console.log('ebanaja tablica', table);

        let wholeTable = '';
        let rows = '';

        for (let i = 1; i < table.length; i++) {
            rows += `<td id="${table[i].id}">${table[i].content}</td>`;
            console.log(i);

            if (i > 0 && i % 5 === 0) {
                console.log('inside if', i);
                wholeTable += `<tr>${rows}</tr>`;
                rows = '';
            }

            if (i + 1 === table.length) {
                wholeTable += `<tr>${rows}</tr>`;
                rows = '';
            }
        }

        return wholeTable;
    }

    // Put generated rows in table 

    function drawTable(table) {
        const htmlTable = document.querySelector('.table');
        htmlTable.innerHTML = `
            <table>
                ${table}
            </table>
        `
        return htmlTable;
    }

    // Get table data -> Generate rows -> DrawTable -> Add click listener -> Check if link has id, if has open modal

    getTableData()
        .then((data) => {
            console.log('data', data);
            return generateRows(data);
        })
        .then((data) => {
            console.log('generated rows', data);
            return drawTable(data);
        })
        .then(() => {
            return addClickListener();
        })
        .then(() => {
            return openModalByLink();
        })

    // Toggle modal on btn click

    if (document.getElementById('add-item')) {
        document.getElementById('add-item').onclick = function () { toggleModal(); }
    }

    // Delete cell

    if (document.getElementById('delete-btn')) {
        document.getElementById('delete-btn').onclick = function () {
            let link = window.location.search;
            let linkParams = new URLSearchParams(link);
            if (linkParams.has('id')) {
                confirmDelete();
            }

        }
    }

    // Close modal

    if (document.getElementById('close-modal')) {
        document.getElementById('close-modal').onclick = function () {
            toggleModal();
        }
    }

    // Submit new item or update

    if (document.getElementById('submit-new-item')) {
        document.getElementById('submit-new-item').onclick = function () {
            const id = document.getElementsByClassName('modal')[0].id.split('-')[1];
            const value = document.getElementById('item-content').value;
            if (value && !id) {
                postData({ content: value })
                    .then((data) => {
                        if (document.getElementsByTagName('tbody').length === 0) {
                            document.querySelector('.table').innerHTML = `<table><tr><td id="${data.id}">${data.content}</td></tr></table>`
                        } else {
                            const elementsInLastRow = document.getElementsByTagName('tr')[document.getElementsByTagName('tr').length - 1].childElementCount;
                            if (elementsInLastRow === 5) {
                                insertRow();
                                return insertCell(data);
                            }
                            return insertCell(data);
                        }

                    })
                toggleModal();
            } else {
                updateData(id, { content: value })
                    .then((data) => {
                        document.getElementById(id).innerHTML = data.content;
                    })
                toggleModal();
            }
        }
    }

    // Toggle main modal

    function toggleModal(id, content) {
        const modal = document.querySelector(".modal");
        modal.classList.toggle('open');
        modal.classList.remove('close');
        if (modal.classList.contains('open')) {
            if (id) {
                modal.id = 'modal-' + id;
                updateURL(id);
                document.getElementById('item-content').value = content;
            }
        } else {
            modal.classList.add('close');
            document.getElementById('item-content').value = '';
            modal.id = '';
            window.history.pushState({ path: window.location.pathname }, '', window.location.pathname);
        }

    }

    // Insert new row cell
    function insertCell(data) {
        const lastRow = document.getElementsByTagName('tr')[document.getElementsByTagName('tr').length - 1];
        lastRow.insertCell(-1).id = data.id;
        const newCell = document.getElementById(data.id);
        newCell.innerHTML = data.content;
        addClickListenerToElement(data.id);
    }

    // Insert new row
    function insertRow() {
        const table = document.getElementsByTagName('tbody')[0];
        table.insertRow(-1);
    }

    // Add click listener to whole table
    function addClickListener() {
        document.querySelectorAll('td').forEach(function (el) {
            el.addEventListener('click', function () {
                toggleModal(this.id, this.innerHTML);
            });
        });
    }

    // Add click listener to new added cell
    function addClickListenerToElement(id) {
        document.getElementById(id).addEventListener('click', function () {
            toggleModal(this.id, this.innerHTML);
        })
    }


    function updateURL(id) {
        if (history.pushState) {
            var newurl = window.location.protocol + "//" + window.location.host + window.location.pathname + '?id=' + id;
            if (newurl !== window.location.href) {
                window.history.pushState({ path: newurl }, '', newurl);
            }
        }
    }

    // Confirm delete

    function confirmDelete() {
        document.getElementById('confirm-delete-modal').classList.toggle('open');
        if (document.getElementById('yes')) {
            document.getElementById('yes').onclick = function () {
                document.getElementById('confirm-delete-modal').classList.toggle('open');
                return deleteCell();
            }
        }
        if (document.getElementById('no')) {
            document.getElementById('no').onclick = function () {
                return document.getElementById('confirm-delete-modal').classList.toggle('open');
            }
        }
    }

    // Delete cell

    function deleteCell() {
        const id = document.getElementsByClassName('modal')[0].id.split('-')[1];
        deleteData(id)
            .then(() => {
                return getTableData();
            })
            .then((data) => {
                return generateRows(data);
            })
            .then((data) => {
                return drawTable(data);
            })
            .then(() => {
                return addClickListener();
            })
        toggleModal();
    }



    // Open modal if link has id 

    function openModalByLink() {
        let link = window.location.search;
        let linkParams = new URLSearchParams(link);
        if (linkParams.has('id')) {
            let cell = document.getElementById(linkParams.get('id'));
            toggleModal(cell.id, cell.innerHTML);
        }
    }

    // Close modal on escape btn
    document.addEventListener("keydown", event => {
        if (event.isComposing || event.keyCode === 27) {
            if (document.querySelector(".modal").classList.contains('open')) {
                return toggleModal();
            }
        }
    });

    // Click outside modal

    document.addEventListener("click", function (event) {
        const modalMain = document.querySelector(".modal").contains(event.target);
        const modalContent = document.getElementById('main-modal-container').contains(event.target);
        if (modalMain && !modalContent) {
            toggleModal();
        }
    });

    // Add data to db. Uncomment function and call it to add 200 items 

    // function fillWithData() {
    //     for (let i = 0; i < 200; i++) {
    //         postData({ content: 'Hi ' + i })
    //     }
    // }

    // fillWithData();

};