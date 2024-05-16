"use client";

import { siteConfig } from "@/config/site";
import { Button } from "@nextui-org/button";
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@nextui-org/dropdown";
import { Input } from "@nextui-org/input";
import { Tooltip } from "@nextui-org/tooltip";
import { strategies } from "@/public/strategies";
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CloseIcon from '@mui/icons-material/Close';
import { createElement, useEffect, useMemo, useState } from "react";
import { Choice } from "@/types";
import { payoff_matrix } from "@/public/payoffs";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip as ChartTooltip, Label } from "recharts";
import colors, { black } from "tailwindcss/colors";


export default function Home() {
	const circleRadius = 16;
	const circleStyle = {
		width: circleRadius * 2,
		height: circleRadius * 2,
		borderRadius: "50%",
		backgroundColor: "#111111",
		borderColor: "#444444",
		borderWidth: "medium",
		transition: "all 0.5s ease"
	};

	const [roundCount, setRoundCount] = useState(siteConfig.defaultRounds);
	const isRoundCountValid = useMemo(() => {
		if (roundCount <= 0 || Number.isNaN(roundCount)) return false;
		return true;
	}, [roundCount]);

	const [currentStrategyPlayer1, setCurrentStrategyPlayer1] = useState(siteConfig.player1DefaultStrategy);
	const [currentStrategyPlayer2, setCurrentStrategyPlayer2] = useState(siteConfig.player2DefaultStrategy);
	const [player1Scores, setPlayer1Scores] = useState<number[]>([0]);
	const [player2Scores, setPlayer2Scores] = useState<number[]>([0]);

	const [results, setResults] = useState<Choice[][]>([]);
	const [currentRound, setCurrentRound] = useState(0);
	const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);

	const [chartData, setChartData] = useState([
		{ round: 0, player1: 0, player2: 0 }
	]);

	// Re-initialize currentRound when roundCount changes
	useEffect(() => {
		setCurrentRound(0);
	}, [roundCount]);

	// Update the chart data when any of the relevant arrays are modified
	useEffect(() => {
		setChartData(prevData => {
			const newPlayer1Total = player1Scores.reduce((acc, val) => acc + val, 0); // Sum of player1Scores
			const newPlayer2Total = player2Scores.reduce((acc, val) => acc + val, 0); // Sum of player2Scores

			return [
				...prevData,
				{
					round: currentRound,
					player1: newPlayer1Total, // Total points for player 1 so far
					player2: newPlayer2Total  // Total points for player 2 so far
				}
			];
		});
	}, [player1Scores, player2Scores, currentRound]);

	const calculateScore = (player1Choice: Choice, player2Choice: Choice): [number, number] => {
		const payoff = payoff_matrix[player1Choice][player2Choice];
		return [payoff[0], payoff[1]];
	}

	const resetSimulation = () => {
		setResults([[], []]);
		setCurrentRound(0);
		setPlayer1Scores([0]);
		setPlayer2Scores([0]);
		setChartData(() => [
			{
				round: 0,
				player1: 0,
				player2: 0
			}
		]);

		if (intervalId) {
			clearInterval(intervalId);
			setIntervalId(null);
		}
	}

	const runSimulation = () => {
		setResults([[], []]);
		resetSimulation();

		const player1Choices: Choice[] = [];
		const player2Choices: Choice[] = [];

		let index = 0;
		const newIntervalId = setInterval(() => {
			if (index < roundCount) {
				const player1Choice = currentStrategyPlayer1.decide(player2Choices, player1Choices);
				const player2Choice = currentStrategyPlayer2.decide(player1Choices, player2Choices);

				player1Choices.push(player1Choice);
				player2Choices.push(player2Choice);

				const [roundPlayer1Score, roundPlayer2Score] = calculateScore(player1Choice, player2Choice);
				setPlayer1Scores(prevScores => prevScores.concat([roundPlayer1Score]));
				setPlayer2Scores(prevScores => prevScores.concat([roundPlayer2Score]));
				setResults([player1Choices, player2Choices]);
				setCurrentRound(index + 1);
				index++;
			} else {
				clearInterval(newIntervalId);
				setIntervalId(null);
			}
		}, 50);

		setIntervalId(newIntervalId);
	};

	const getCircleColor = (player: 0 | 1, index: number) => {
		if (index < currentRound) {
			return results[player]?.[index] === "Cooperate" ? "green" : results[player]?.[index] === "Defect" ? "red" : "#111111";
		} else {
			return "#111111";
		}
	};

	const circlesPlayer1 = Array.from({ length: roundCount }, (_, index) => (
		<div key={index} className="flex flex-col space-y-2 leading-0 place-items-center">
			<div className={`flex flex-col leading-5 place-items-center ${index < currentRound ? "space-x-1" : ""}`}>
				<p className="font-semibold">
					Round {index + 1}
				</p>
				<p
					className={`font-light text-sm ${index < currentRound ? "opacity-100" : "opacity-0"}`}
					style={{ transition: "opacity 0.5s ease" }}
				>
					{index < currentRound ? `${results[0]?.[index]}s` : ""}
				</p>
			</div>

			<div
				key={index}
				style={{ ...circleStyle, backgroundColor: getCircleColor(0, index) }}
				className="border border-gray-300"
			/>
		</div>
	));

	const circlesPlayer2 = Array.from({ length: roundCount }, (_, index) => (
		<div key={index} className="flex flex-col space-y-2 leading-0 place-items-center">
			<div className={`flex flex-col leading-5 place-items-center ${index < currentRound ? "space-x-1" : ""}`}>
				<p className="font-semibold">
					Round {index + 1}
				</p>
				<p
					className={`font-light text-sm ${index < currentRound ? "opacity-100" : "opacity-0"}`}
					style={{ transition: "opacity 0.5s ease" }}
				>
					{index < currentRound ? `${results[1]?.[index]}s` : ""}
				</p>
			</div>

			<div
				key={index}
				style={{ ...circleStyle, backgroundColor: getCircleColor(1, index) }}
				className="border border-gray-300"
			/>
		</div>
	));

	return (
		<section>
			<div className="flex flex-col space-y-4 place-items-center">
				<h1 id="TitleText" className="text-4xl font-semibold">The Prisoner&apos;s Dilemma</h1>
				<div className="flex flex-row space-x-4 place-items-center">
					<Tooltip content="How many rounds should the simulation run?" closeDelay={0}>
						<Input
							type="number"
							variant="faded"
							size="sm"
							label="Rounds"
							aria-label="Number of rounds"
							value={roundCount.toString()}
							onChange={(e) => {
								resetSimulation();
								setRoundCount(parseInt(e.target.value, 10) < 1001 ? parseInt(e.target.value, 10) : 1000);
							}}
						/>
					</Tooltip>

					<Tooltip content="Run simulation" closeDelay={0}>
						<Button
							color="primary"
							aria-label="Run simulation"
							onClick={() => {
								runSimulation();
							}}
							isDisabled={!isRoundCountValid}
							isIconOnly={true}
						>
							<PlayArrowIcon />
						</Button>
					</Tooltip>

					<Tooltip content="Clear the simulation" closeDelay={0}>
						<Button
							color="danger"
							variant="faded"
							aria-label="Reset simulation"
							onClick={() => {
								resetSimulation();
							}}
							isIconOnly={true}
						>
							<CloseIcon />
						</Button>
					</Tooltip>
				</div>

				<div className="flex flex-row space-x-8 place-self-center pt-8">
					<div className="flex flex-col space-y-4 place-items-center">
						<div className="flex flex-col place-items-center space-y-2">
							<div className="flex flex-col place-items-center">
								<h1 className="place-self-center text-2xl text-blue-500">Player 1</h1>
								<p className="text-blue-300">Score: {player1Scores.reduce((partialSum, a) => partialSum + a, 0)}</p>
							</div>
							<div className="flex flex-col max-w-sm place-items-center space-y-4">
								<Dropdown
									showArrow
									backdrop="blur"
									classNames={{
										base: "before:bg-default-200",
										content: "py-1 px-1 border border-default-200 bg-gradient-to-br from-white to-default-200 dark:from-default-100 dark:to-black"
									}}
								>
									<DropdownTrigger>
										<Button color="default" variant="faded" endContent={<ArrowDropDownIcon />}>{currentStrategyPlayer1.label}</Button>
									</DropdownTrigger>
									<DropdownMenu
										color="default"
										aria-label="Select strategy"
										items={strategies}
										onAction={(key) => {
											const foundStrategy = strategies.find(s => s.key === key);
											if (foundStrategy) {
												setCurrentStrategyPlayer1(foundStrategy);
											} else {
												// The case where the strategy wasn't found
												// Just going to do nothing for now because I'm lazy
											}
										}}
									>
										{(strategy) => (
											<DropdownItem key={strategy.key}>{strategy.label}</DropdownItem>
										)}
									</DropdownMenu>
								</Dropdown>
								<p className="text-center text-sm h-16 overflow-auto">{currentStrategyPlayer1.description}</p>
							</div>
						</div>

						<div className="flex flex-col space-y-1">
							{circlesPlayer1}
						</div>
					</div>
					
					<div>
						<ResponsiveContainer width={500} height={500} className={currentRound !== 0 ? "" : "hidden"}>
							<LineChart data={chartData} margin={{top: 32, right: 32, bottom: 32, left: 32}}>
								<Line 
									type="monotone" 
									dataKey="player1" 
									stroke={colors.blue[500]} 
									strokeWidth={2} 
									animationDuration={0}
								/>
								<Line 
									type="monotone" 
									dataKey="player2" 
									stroke={colors.orange[500]} 
									strokeWidth={2}
									animationDuration={0}
								/>
								<CartesianGrid strokeOpacity={0.2} />
								<ChartTooltip 
									cursor={{stroke: "white", strokeWidth: 2}}
									separator=": "
									content={({ active, payload, label }) => {
										if (active && payload && payload.length) {
											return (
												<div className="flex flex-col place-items-center p-2 border-2 border-default rounded-md text-white bg-gradient-to-br from-default-100 dark:to-black">
													<p className="font-semibold text-lg">Round {label}</p>
													<p className="text-blue-500 text-md">Player 1: {payload[0].value} points</p>
													<p className="text-orange-500 text-md">Player 2: {payload[1].value} points</p>
												</div>
											);
										}
									}}
									animationDuration={100}
								/>
								<XAxis 
									dataKey="round"
									padding={{ right: 10, left: 10 }}
									mirror={true}
									tickCount={8}
									type="number"
									domain={[0, roundCount]}
									tick={({ x, y, payload }) => {
										return (
											<g transform={`translate(${x-2},${y})`}>
												<rect x={-7} y={-7} width={14} height={14} fill="black"/>
												<text x={0} y={3.5} textAnchor="middle" fill="white" fontSize={14}>{payload.value}</text>
											</g>
										);
									}}
								>
									<Label position="insideBottom" offset={-18}>Rounds</Label>
								</XAxis>
								<YAxis 
									padding={{ top: 10, bottom: 10 }} 
									mirror={true}
									type="number"
									domain={[0, "dataMax"]}
									tickCount={8}
									tick={({ x, y, payload }) => {
										return (
											<g transform={`translate(${x+4},${y+2})`}>
												<rect x={-7} y={-7} width={14} height={14} fill="black"/>
												<text x={0} y={3.5} textAnchor="middle" fill="white" fontSize={14}>{payload.value}</text>
											</g>
										);
									}}
								>
									<Label position="insideLeft" angle={-90} offset={-16}>Points</Label>
								</YAxis>
							</LineChart>
						</ResponsiveContainer>
					</div>

					<div className="flex flex-col space-y-4 place-items-center">
						<div className="flex flex-col place-items-center space-y-2">
							<div className="flex flex-col place-items-center">
								<h1 className="place-self-center text-2xl text-orange-500">Player 2</h1>
								<p className="text-orange-300">Score: {player2Scores.reduce((partialSum, a) => partialSum + a, 0)}</p>
							</div>
							<div className="flex flex-col max-w-sm place-items-center space-y-4">
								<Dropdown
									showArrow
									backdrop="blur"
									classNames={{
										base: "before:bg-default-200",
										content: "py-1 px-1 border border-default-200 bg-gradient-to-br from-white to-default-200 dark:from-default-100 dark:to-black"
									}}
								>
									<DropdownTrigger>
										<Button color="default" variant="faded" endContent={<ArrowDropDownIcon />}>{currentStrategyPlayer2.label}</Button>
									</DropdownTrigger>
									<DropdownMenu
										color="default"
										aria-label="Select strategy"
										items={strategies}
										onAction={(key) => {
											const foundStrategy = strategies.find(s => s.key === key);
											if (foundStrategy) {
												setCurrentStrategyPlayer2(foundStrategy);
											} else {
												// The case where the strategy wasn't found
												// Just going to do nothing for now because I'm lazy
											}
										}}
									>
										{(strategy) => (
											<DropdownItem key={strategy.key}>{strategy.label}</DropdownItem>
										)}
									</DropdownMenu>
								</Dropdown>
								<p className="text-center text-sm h-16 overflow-auto">{currentStrategyPlayer2.description}</p>
							</div>
						</div>

						<div className="flex flex-col space-y-1">
							{circlesPlayer2}
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}