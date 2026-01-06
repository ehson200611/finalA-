import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Clock, Users, Star } from 'lucide-react'

const CourseCard = ({
	title,
	description,
	duration,
	students,
	rating,
	image,
	price = 'Бесплатно',
}) => {
	return (
		<Card className='group overflow-hidden border-border hover:border-primary transition-all duration-300 hover:shadow-lg hover:scale-[1.02] bg-gradient-card'>
			<CardHeader className='p-0'>
				<div className='relative overflow-hidden rounded-t-lg h-48'>
					<img
						src={image}
						alt={title}
						className='w-full h-full object-cover group-hover:scale-110 transition-transform duration-500'
					/>
					<div className='absolute top-4 right-4 bg-highlight text-highlight-foreground px-3 py-1 rounded-full text-sm font-semibold shadow-md'>
						{price}
					</div>
				</div>
			</CardHeader>
			<CardContent className='p-6'>
				<h3 className='text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors'>
					{title}
				</h3>
				<p className='text-sm text-muted-foreground mb-4 line-clamp-2'>
					{description}
				</p>
				<div className='flex items-center gap-4 text-sm text-muted-foreground'>
					<div className='flex items-center gap-1'>
						<Clock className='h-4 w-4 text-primary' />
						<span>{duration}</span>
					</div>
					<div className='flex items-center gap-1'>
						<Users className='h-4 w-4 text-accent' />
						<span>{students}+</span>
					</div>
					<div className='flex items-center gap-1'>
						<Star className='h-4 w-4 text-highlight fill-highlight' />
						<span>{rating}</span>
					</div>
				</div>
			</CardContent>
		</Card>
	)
}

export default CourseCard
