
import React from 'react';
import type {FilialItem} from "@/types/Filial.ts";

export const FilialCard = ({filial}: { filial: FilialItem })=>{
    if(!filial){
        return <div>Ошибка: филиалы не загружены</div>
    }

    return (
        <div>


        </div>
    )
}
