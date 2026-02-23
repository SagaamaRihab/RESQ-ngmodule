package it.unibg.resq.dto;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor

public class UserPositionDto {
    private String userId;
    private String nodeId;
    private long timestamp;
    private double xCoord;
    private double yCoord;
}
