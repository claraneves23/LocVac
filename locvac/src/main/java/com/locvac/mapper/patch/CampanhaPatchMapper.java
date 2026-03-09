package com.locvac.mapper.patch;

import com.locvac.dto.CampanhaPatchDTO;
import com.locvac.mapper.config.PatchMapperConfig;
import com.locvac.model.core.Campanha;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

@Mapper(config = PatchMapperConfig.class)
public interface CampanhaPatchMapper {
    void patch(CampanhaPatchDTO dto,
               @MappingTarget Campanha entity);
}
