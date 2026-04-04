// shared.js
// This file acts as our "Database" and handles all localStorage syncing.

window.ERP = {
    data: {
        branches: [],
        products: [],
        inventory: [],
        orders: [],
        transfers: [],
        alerts: [],
        users: [],
        currentUser: null
    },

    init: function() {
        const isSeeded = localStorage.getItem('erp_seeded_auth_v2');
        
        if (!isSeeded) {
            localStorage.clear();
            this.seedData();
        } else {
            this.loadData();
        }
        
        this.checkAlerts();
    },

    seedData: function() {
        this.data.branches = [
            { id: 1, name: 'Mumbai H.O.', location: 'Mumbai', is_active: true },
            { id: 2, name: 'Pune Godown', location: 'Pune', is_active: true },
            { id: 3, name: 'Delhi Hub', location: 'Delhi', is_active: true },
            { id: 4, name: 'Bangalore Depot', location: 'Bangalore', is_active: true },
        ];

        this.data.products = [
            { id: 1, name: 'Copper Wire 1.5 sqmm', sku: 'WIR-CU-15', category: 'Wires', unit_price: 1200 },
            { id: 2, name: 'MCB 32A Double Pole', sku: 'SWG-MCB-32', category: 'Switchgears', unit_price: 450 },
            { id: 3, name: 'LED Panel 12W', sku: 'LGT-LED-12', category: 'Lighting', unit_price: 350 },
            { id: 4, name: 'Distribution Board 8-Way', sku: 'SWG-DB-8', category: 'Switchgears', unit_price: 2500 },
        ];

        let invId = 1;
        this.data.branches.forEach(b => {
            this.data.products.forEach(p => {
                let qty = Math.floor(Math.random() * 200) + 10;
                if(b.id === 2 && p.id === 1) qty = 25; // Force low stock for alert demo
                if(b.id === 1 && p.id === 1) qty = 450; // Force overstock for transfer suggestion demo
                this.data.inventory.push({
                    id: invId++,
                    branch_id: b.id,
                    product_id: p.id,
                    quantity: qty,
                    min_threshold: 30,
                    max_threshold: 300,
                    updated_at: new Date().toISOString()
                });
            });
        });

        this.data.orders = [
            { id: 1, branch_id: 1, product_id: 2, quantity: 50, status: 'approved', created_at: new Date(Date.now() - 86400000).toISOString() },
            { id: 2, branch_id: 2, product_id: 3, quantity: 15, status: 'pending', created_at: new Date().toISOString() },
            { id: 3, branch_id: 3, product_id: 1, quantity: 200, status: 'approved', created_at: new Date(Date.now() - 172800000).toISOString() },
            { id: 4, branch_id: 4, product_id: 4, quantity: 5, status: 'approved', created_at: new Date(Date.now() - 50000000).toISOString() }
        ];

        this.data.transfers = [
            { id: 1, from_branch_id: 1, to_branch_id: 2, product_id: 1, quantity: 50, status: 'in-transit', created_at: new Date(Date.now() - 3600000).toISOString() }
        ];

        this.data.users = [
            { id: 1, fullName: 'Admin User', email: 'admin@erp.com', password: 'password', role: 'Owner', phone: '+91 9999999999' }
        ];

        this.saveData();
        localStorage.setItem('erp_seeded_auth_v2', 'true');
    },

    loadData: function() {
        this.data.branches = JSON.parse(localStorage.getItem('erp_branches') || '[]');
        this.data.products = JSON.parse(localStorage.getItem('erp_products') || '[]');
        this.data.inventory = JSON.parse(localStorage.getItem('erp_inventory') || '[]');
        this.data.orders = JSON.parse(localStorage.getItem('erp_orders') || '[]');
        this.data.transfers = JSON.parse(localStorage.getItem('erp_transfers') || '[]');
        this.data.alerts = JSON.parse(localStorage.getItem('erp_alerts') || '[]');
        this.data.users = JSON.parse(localStorage.getItem('erp_users') || '[]');
        const storedUser = localStorage.getItem('erp_currentUser');
        this.data.currentUser = storedUser && storedUser !== "undefined" ? JSON.parse(storedUser) : null;
    },

    saveData: function() {
        localStorage.setItem('erp_branches', JSON.stringify(this.data.branches));
        localStorage.setItem('erp_products', JSON.stringify(this.data.products));
        localStorage.setItem('erp_inventory', JSON.stringify(this.data.inventory));
        localStorage.setItem('erp_orders', JSON.stringify(this.data.orders));
        localStorage.setItem('erp_transfers', JSON.stringify(this.data.transfers));
        localStorage.setItem('erp_alerts', JSON.stringify(this.data.alerts));
        localStorage.setItem('erp_users', JSON.stringify(this.data.users));
        localStorage.setItem('erp_currentUser', JSON.stringify(this.data.currentUser));
    },

    register: function(fullName, email, password, role, phone) {
        if(this.data.users.find(u => u.email === email)) return false;
        const newUser = { id: Date.now(), fullName, email, password, role, phone };
        this.data.users.push(newUser);
        this.data.currentUser = newUser;
        this.saveData();
        return true;
    },

    login: function(email, password) {
        const user = this.data.users.find(u => u.email === email && u.password === password);
        if(user) { this.data.currentUser = user; this.saveData(); return true; }
        return false;
    },

    logout: function() {
        this.data.currentUser = null;
        this.saveData();
        window.location.href = 'index.html';
    },

    checkAuth: function() {
        if(!this.data.currentUser && !window.location.href.includes('index.html')) {
            window.location.href = 'index.html';
        }
    },

    updateProfile: function(fullName, email, role, phone) {
        if(!this.data.currentUser) return;
        let user = this.data.users.find(u => u.id === this.data.currentUser.id);
        if(user) {
            user.fullName = fullName; user.email = email; user.role = role; user.phone = phone;
            this.data.currentUser = user; 
            this.saveData(); return true;
        }
        return false;
    },

    addBranch: function(name, location) {
        const newId = this.data.branches.length ? Math.max(...this.data.branches.map(b => b.id)) + 1 : 1;
        this.data.branches.push({ id: newId, name, location, is_active: true });
        this.saveData();
        return newId;
    },

    deleteBranch: function(branchId) {
        this.data.branches = this.data.branches.filter(b => b.id !== branchId);
        this.data.inventory = this.data.inventory.filter(i => i.branch_id !== branchId);
        this.data.orders = this.data.orders.filter(o => o.branch_id !== branchId);
        this.data.transfers = this.data.transfers.filter(t => t.from_branch_id !== branchId && t.to_branch_id !== branchId);
        this.saveData();
        this.checkAlerts();
        return true;
    },

    getInventoryDetails: function() {
        return this.data.inventory.map(inv => {
            const product = this.data.products.find(p => p.id === inv.product_id);
            const branch = this.data.branches.find(b => b.id === inv.branch_id);
            return {
                ...inv,
                product_name: product ? product.name : 'Unknown',
                sku: product ? product.sku : 'Unknown',
                category: product ? product.category : 'Unknown',
                unit_price: product ? product.unit_price : 0,
                branch_name: branch ? branch.name : 'Unknown',
                total_value: (product ? product.unit_price : 0) * inv.quantity
            };
        });
    },

    addProduct: function(productData, targetBranchId) {
        let existingProd = this.data.products.find(p => p.sku === productData.sku);
        let prodId = existingProd ? existingProd.id : 0;
        
        if(!existingProd) {
            prodId = this.data.products.length ? Math.max(...this.data.products.map(p => p.id)) + 1 : 1;
            const newProduct = {
                id: prodId,
                name: productData.name,
                sku: productData.sku,
                category: productData.category,
                unit_price: productData.unit_price
            };
            this.data.products.push(newProduct);
        }

        let invId = this.data.inventory.length ? Math.max(...this.data.inventory.map(i => i.id)) + 1 : 1;
        
        let existingInv = this.data.inventory.find(i => i.product_id === prodId && i.branch_id === targetBranchId);
        if(existingInv) {
            existingInv.quantity += productData.initialQuantity;
            existingInv.updated_at = new Date().toISOString();
        } else {
            this.data.inventory.push({
                id: invId++,
                branch_id: targetBranchId,
                product_id: prodId,
                quantity: productData.initialQuantity || 0,
                min_threshold: 30,
                max_threshold: 400,
                updated_at: new Date().toISOString()
            });
        }
        
        this.saveData();
        return prodId;
    },

    editInventory: function(invId, newQty, targetBranchId) {
        const inv = this.data.inventory.find(i => i.id === invId);
        if(inv) {
            inv.quantity = parseInt(newQty);
            inv.branch_id = parseInt(targetBranchId);
            inv.updated_at = new Date().toISOString();
            this.saveData();
            this.checkAlerts();
            return true;
        }
        return false;
    },

    deleteInventory: function(invId) {
        this.data.inventory = this.data.inventory.filter(i => i.id !== invId);
        this.saveData();
        this.checkAlerts();
    },

    addOrder: function(orderData) {
        const newId = this.data.orders.length ? Math.max(...this.data.orders.map(o => o.id)) + 1 : 1;
        const newOrder = {
            id: newId,
            ...orderData,
            status: 'pending',
            created_at: new Date().toISOString()
        };
        this.data.orders.unshift(newOrder);
        this.saveData();
        return newOrder;
    },

    approveOrder: function(orderId) {
        const order = this.data.orders.find(o => o.id === orderId);
        if(!order || order.status !== 'pending') return false;

        const inv = this.data.inventory.find(i => i.branch_id == order.branch_id && i.product_id == order.product_id);
        if(!inv || inv.quantity < order.quantity) {
            alert('Not enough stock in branch to fulfill this order!');
            return false;
        }

        inv.quantity -= order.quantity;
        inv.updated_at = new Date().toISOString();
        
        order.status = 'approved';
        this.saveData();
        this.checkAlerts();
        return true;
    },

    addTransfer: function(transferData) {
        const newId = this.data.transfers.length ? Math.max(...this.data.transfers.map(t => t.id)) + 1 : 1;
        const sourceInv = this.data.inventory.find(i => i.branch_id == transferData.from_branch_id && i.product_id == transferData.product_id);
        if(!sourceInv || sourceInv.quantity < transferData.quantity) {
             alert('Cannot initiate transfer. Source branch has insufficient stock.');
             return false;
        }

        sourceInv.quantity -= transferData.quantity;

        const newTransfer = {
            id: newId,
            ...transferData,
            status: 'in-transit',
            created_at: new Date().toISOString()
        };
        this.data.transfers.unshift(newTransfer);
        this.saveData();
        this.checkAlerts();
        return true;
    },

    completeTransfer: function(transferId) {
        const transfer = this.data.transfers.find(t => t.id === transferId);
        if(!transfer || transfer.status !== 'in-transit') return;

        const destInv = this.data.inventory.find(i => i.branch_id == transfer.to_branch_id && i.product_id == transfer.product_id);
        if(destInv) {
            destInv.quantity += parseInt(transfer.quantity);
            destInv.updated_at = new Date().toISOString();
        } else {
            let invId = this.data.inventory.length ? Math.max(...this.data.inventory.map(i => i.id)) + 1 : 1;
            this.data.inventory.push({
                id: invId,
                branch_id: transfer.to_branch_id,
                product_id: transfer.product_id,
                quantity: parseInt(transfer.quantity),
                min_threshold: 30,
                max_threshold: 400,
                updated_at: new Date().toISOString()
            });
        }

        transfer.status = 'completed';
        this.saveData();
        this.checkAlerts();
    },

    checkAlerts: function() {
        this.data.alerts = [];
        let alertId = 1;
        
        const groupedInv = {};

        this.data.inventory.forEach(inv => {
            const b = this.data.branches.find(br => br.id === inv.branch_id);
            const p = this.data.products.find(pr => pr.id === inv.product_id);
            if(!b || !p) return;
            
            if(!groupedInv[inv.product_id]) groupedInv[inv.product_id] = [];
            groupedInv[inv.product_id].push(inv);

            if(inv.quantity < inv.min_threshold) {
                this.data.alerts.push({
                    id: alertId++,
                    branch_id: inv.branch_id,
                    product_id: inv.product_id,
                    type: 'Low Stock',
                    message: `${p.name} critically low at ${b.name} (${inv.quantity} left).`,
                    priority: 'HIGH',
                    created_at: new Date().toISOString(),
                    metadata: { qty: inv.quantity }
                });
            }
            if(inv.quantity > inv.max_threshold) {
                this.data.alerts.push({
                    id: alertId++,
                    branch_id: inv.branch_id,
                    product_id: inv.product_id,
                    type: 'Overstock',
                    message: `${b.name} is overstocked on ${p.name} (${inv.quantity} units).`,
                    priority: 'LOW',
                    created_at: new Date().toISOString(),
                    metadata: { qty: inv.quantity }
                });
            }
        });

        Object.keys(groupedInv).forEach(prodId => {
            const group = groupedInv[prodId];
            if(group.length < 2) return;
            
            let highest = group.reduce((a, b) => a.quantity > b.quantity ? a : b);
            let lowest = group.reduce((a, b) => a.quantity < b.quantity ? a : b);
            
            if(highest.quantity > highest.max_threshold && lowest.quantity < lowest.min_threshold) {
                const bHigh = this.data.branches.find(br => br.id === highest.branch_id);
                const bLow = this.data.branches.find(br => br.id === lowest.branch_id);
                const p = this.data.products.find(pr => pr.id == prodId);
                const diff = highest.quantity - highest.max_threshold;
                
                this.data.alerts.push({
                    id: alertId++,
                    branch_id: null,
                    product_id: parseInt(prodId),
                    type: 'Balance Suggestion',
                    message: `Internal Transfer Recommended: Move ${diff}x ${p.name} from ${bHigh.name} to ${bLow.name}.`,
                    priority: 'MEDIUM',
                    created_at: new Date().toISOString(),
                    metadata: {
                        from_branch: highest.branch_id,
                        to_branch: lowest.branch_id,
                        qty: diff
                    }
                });
            }
        });

        this.saveData();
    },

    resolveAlert: function(alertId) {
        const alertIndex = this.data.alerts.findIndex(a => a.id === alertId);
        if(alertIndex === -1) return false;
        
        const alert = this.data.alerts[alertIndex];
        
        if (alert.type === 'Balance Suggestion') {
            this.addTransfer({
                from_branch_id: alert.metadata.from_branch,
                to_branch_id: alert.metadata.to_branch,
                product_id: alert.product_id,
                quantity: alert.metadata.qty
            });
        } else if (alert.type === 'Low Stock') {
            const inv = this.data.inventory.find(i => i.branch_id === alert.branch_id && i.product_id === alert.product_id);
            if(inv) {
                inv.quantity += (inv.max_threshold / 2);
                inv.updated_at = new Date().toISOString();
            }
        } else if (alert.type === 'Overstock') {
            const inv = this.data.inventory.find(i => i.branch_id === alert.branch_id && i.product_id === alert.product_id);
            if(inv) {
                inv.quantity = inv.max_threshold - 20;
                inv.updated_at = new Date().toISOString();
            }
        }
        
        this.data.alerts.splice(alertIndex, 1);
        this.saveData();
        return true;
    }
};

ERP.init();
