import { Point } from '@/src/types';
import React, {useEffect, useMemo, useRef, useState } from 'react';
import kun from './assets/img/kun.png';
import jntm from './assets/audio/jntm.mp3';
import ngm from './assets/audio/ngm.mp3';
import j from './assets/audio/j.mp3';

interface IProps {
  HEIGHT: number;
  WIDTH: number;
  color: string;
  maxLength: number;
}

export default function Ikun({ HEIGHT = 600, WIDTH = 1000, color = '#182562', maxLength = 450 }: IProps) {
	const canvas = useRef<HTMLCanvasElement | null>(null);
	const context = useRef<CanvasRenderingContext2D | null>(null);
	let ctx: CanvasRenderingContext2D;

	const imgContainer = useRef<HTMLDivElement | null>(null);
	const imgHeight = 300,
		imgWidth = 200;
	let animationFrameId: number;

	const [dragTrigger, setDragTrigger] = useState<boolean>(false);
	const [triggerOffset, setTriggerOffset] = useState<Point>({ x: 0, y: 0 });
	const triggerPoint: Point = { x: WIDTH / 2, y: HEIGHT / 2 };
	const offset = { x: 0, y: 0 };

	const audios = useMemo(() => [new Audio(ngm), new Audio(jntm), new Audio(j)], []);

	const updateOffset = () => {
		offset.x = canvas.current!.offsetLeft;
		offset.y = canvas.current!.offsetTop;
		triggerPoint.x = offset.x + WIDTH / 2;
		triggerPoint.y = offset.y + HEIGHT / 2;
	};

	const init = () => {
		if (!canvas.current) {
			return;
		}
		context.current = canvas.current!.getContext('2d');
		ctx = context.current!;
		if (!ctx) {
			return;
		}
		ctx.clearRect(0, 0, WIDTH, HEIGHT);
	};

	const initKunImage = () => {
		const kunImage = new Image(imgWidth, imgHeight);
		kunImage.src = kun;
		imgContainer.current = document.createElement('div');
		imgContainer.current.style.position = 'absolute';
		imgContainer.current.style.left = '50%';
		imgContainer.current.style.top = '50%';
		imgContainer.current.style.transform = 'translate3d(-50%, -50% , 0)';
		imgContainer.current.style.display = 'flex';
		kunImage.draggable = false;
		imgContainer.current.appendChild(kunImage);
    document.getElementById('root')!.appendChild(imgContainer.current);
	};

	const removeKunImage = () => {
    document.getElementById('root')!.removeChild(imgContainer.current!);
	};

	const drawLine = (point1: Point, point2: Point) => {
		ctx.beginPath();
		ctx.strokeStyle = color;
		ctx.lineWidth = 10;
		ctx.moveTo(point1.x, point1.y);
		ctx.quadraticCurveTo(WIDTH / 2, HEIGHT - 100, point2.x - offset.x + triggerOffset.x, point2.y - offset.y + triggerOffset.y);
		ctx.stroke();
	};
	const draw = () => {
		ctx.clearRect(0, 0, WIDTH, HEIGHT);
		drawLine({ x: WIDTH / 2, y: HEIGHT }, triggerPoint);
	};
	const dragEventFunc = (e: MouseEvent) => {
		e.preventDefault();
		setTriggerOffset({ x: WIDTH / 2 + offset.x - triggerPoint.x, y: HEIGHT / 2 + offset.y - triggerPoint.y });
		triggerPoint.x = e.pageX;
		triggerPoint.y = e.pageY;
		setDragTrigger(true);
	};
	const moveFunc = (e: MouseEvent) => {
		e.preventDefault();
		if (dragTrigger) {
			const y_distence: number = offset.y + HEIGHT - e.pageY - triggerOffset.y;
			const x_distence: number = e.pageX - triggerOffset.x - WIDTH / 2 - offset.x;
			if (Math.sqrt(x_distence * x_distence + y_distence * y_distence) < maxLength) {
				triggerPoint.x = e.pageX;
				triggerPoint.y = e.pageY;
        imgContainer.current!.style.transformOrigin = 'center';
        imgContainer.current!.style.transform = `translate3d(${triggerPoint.x - WIDTH / 2 - imgWidth / 2 - offset.x + triggerOffset.x}px, ${triggerPoint.y - HEIGHT / 2 - imgHeight / 2 - offset.y + triggerOffset.y}px, 0) rotate(${-Math.atan2(y_distence, x_distence) + Math.PI / 2}rad)`;
			}
		}
	};
	const freeFunc = () => {
		if (dragTrigger) {
			playAudio();
		}
		setDragTrigger(false);
		setTriggerOffset({ x: 0, y: 0 });
		updateOffset();
	};
	const playAudio = () => {
		const random = Math.floor((Math.random() * 10000) % 3);
		for (const audio of audios) {
			audio.pause();
			audio.currentTime = 0;
		}
		audios[random].play();
	};
	const initEvent = () => {
    imgContainer.current!.addEventListener('mousedown', dragEventFunc);
    document.addEventListener('mousemove', moveFunc);
    document.addEventListener('mouseup', freeFunc);
	};
	const cacelEvent = () => {
    imgContainer.current!.removeEventListener('mousedown', dragEventFunc);
    document.removeEventListener('mousemove', moveFunc);
    document.removeEventListener('mouseup', freeFunc);
	};

	const frame = () => {
		draw();
	};

	const startFrame = () => {
		animationFrameId = requestAnimationFrame(() => {
			frame();
			startFrame();
		});
	};

	const mounted = () => {
		init();
		initKunImage();
		updateOffset();
		initEvent();
		startFrame();
		return () => {
			removeKunImage();
			cacelEvent();
			cancelAnimationFrame(animationFrameId);
		};
	};
	useEffect(mounted, [dragTrigger, triggerOffset]);
	return <>
		<canvas ref={canvas} width={WIDTH} height={HEIGHT}></canvas>
	</>;
}
