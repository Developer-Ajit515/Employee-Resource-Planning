import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer
} from "recharts";

function TaskStatusChart({
    completed,
    pending
}) {

    const data = [
        {
            name: "Completed",
            value: completed
        },
        {
            name: "Pending",
            value: pending
        }
    ];

    return (

        <ResponsiveContainer
            width="100%"
            height={280}
        >

            <PieChart>

                <Pie
                    data={data}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={4}
                >

                    {data.map((_, index) => (
                        <Cell
                            key={index}
                            fill={
                                index === 0
                                    ? "#2563eb"
                                    : "#f59e0b"
                            }
                        />
                    ))}

                </Pie>

                <Tooltip />

            </PieChart>

        </ResponsiveContainer>
    );
}

export default TaskStatusChart;