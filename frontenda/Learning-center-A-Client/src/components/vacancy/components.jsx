import React from 'react'

const Components = ({icon,name,description,time}) => {
return (
    <>

    <div className='hidden sm:block'>
    <div className='border w-[280px] h-[350px] rounded-md shadow p-[20px] flex flex-col justify-around'>
    <button className='text-[#00CED1] font-bold'>{icon}</button>
    <h2 className='text-[24px] font-[500]'>{name}</h2>
    <span className='text-[#999999] text-[18px]'>{description}</span>
    <p className='text-[20px] font-[500] text-[#00b9bc]'>{time}</p>
    </div>
    </div>


    <div className='sm:hidden'>
    <div className='border w-[95%] m-auto h-[350px] rounded-md shadow p-[20px] flex flex-col justify-around'>
    <button className='text-[#00CED1] font-bold'>{icon}</button>
    <h2 className='text-[24px] font-[500]'>{name}</h2>
    <span className='text-[#999999] text-[18px]'>{description}</span>
    <p className='text-[20px] font-[500] text-[#00b9bc]'>{time}</p>
    </div>
    </div>

    </>
)
}

export default React.memo(Components)