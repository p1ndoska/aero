const prisma = require ('../prisma/prisma-client');

const RoleController = {
    createRole: async (req, res) => {
        const {name} = req.body;

        if(!name || !name.trim()){
            return res.status(400).send({error: 'Введите роль'});
        }


        try{
            const existingRole = await prisma.role.findUnique({
                where: {name: name}
            });
            if(existingRole){
               return res.status(400).json({error:"Роль уже существует"})
            }

           const role = await prisma.role.create({
               data:{name: name}
           });
            return res.status(200).json(`Роль успешно создана: ${role.name}`);

        }catch(error){
            console.error('create role error', error);
            return res.status(502).json({err:'Internal server error'});
        }
    },
    getRoles: async (req, res) => {
        try{
            const roles = await prisma.role.findMany()
            return res.status(200).json(roles);
        }catch(error){
            console.error('get Roles error', error);
            return res.status(502).json({err:'Internal server error'});
        }
    },
    getRoleById: async (req, res) => {
        const {id} = req.params;

        const roleId = parseInt(id, 10);

        if(isNaN(roleId)) {
            return res.status(400).json({error: 'Неверный формат ID'});
        }
        if(!roleId){
            return res.status(400).json({error:"Роль не найдена"})
        }

        try{
            const role = await prisma.role.findUnique({
                where: {id: roleId}
            })

            if(!role){
                return res.status(400).json({error:'Роль не найден'})
            }

            return res.status(200).json(role);

        }catch(error){
            console.error('get Role By Id error', error);
            return res.status(502).json({err:'Internal server error'});
        }
    },
    updateRole: async (req, res) => {
        const {id} = req.params;
        const {name} = req.body;
        if(!name || !name.trim()){
            return res.status(400).json({error:"Заполните поля"})
        }
        const roleId = parseInt(id, 10);
        if(!roleId){
            return res.status(400).json({error:"Роль не найдена"})
        }
        if(isNaN(roleId)){
            return res.status(400).json({error: 'Неверный формат ID'});
        }

        try{
            const updtRole = await prisma.role.update({
                where: {id: roleId},
                data:{name: name|| undefined},
            })

            return res.status(200).json(updtRole);
        }catch(error){
            console.error('update role error', error);
            return res.status(502).json({err:'Internal server error'});
        }
    },
    deleteRole: async (req, res) => {
        const {id} = req.params;
        const roleId = parseInt(id, 10);
        if(!roleId){
            return res.status(400).json({error:"Роль не найдена"})
        }
        if(isNaN(roleId)){
            return res.status(400).json({error: 'Неверный формат ID'});
        }

        try {
            const trancate = await prisma.role.delete({where: {id: roleId}});
            return res.status(200).json(trancate);
        }catch(error){
            console.error('delete role error', error);
            return res.status(502).json({err:'Internal server error'});
        }
    }
}
module.exports = RoleController;
